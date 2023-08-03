import { Client } from 'minio'
import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import type { FilesService } from '../types'
import { generateFileId, splitBase64DataUri } from '../file-utils'

interface MinioConfig {
  endpoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucket: string
  region: string
  baseUrl?: string
}

export const createMinioFilesService = (config: MinioConfig): FilesService =>
  new MinioFilesService(config)

class MinioFilesService implements FilesService {
  private config: Required<MinioConfig>

  constructor(config: MinioConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? '/api/v1/fs/images',
    }
  }

  createMinioClient() {
    return new Client({
      endPoint: this.config.endpoint,
      port: this.config.port,
      region: this.config.region,
      useSSL: this.config.useSSL,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey,
    })
  }

  private static async ensureBucket(
    client: Client,
    bucket: string,
    region: string
  ) {
    const exists = await client.bucketExists(bucket)
    if (!exists) {
      await client.makeBucket(bucket, region)
    }
  }

  async tryConvertDataUrlToUrl(url: string) {
    const client = this.createMinioClient()
    await MinioFilesService.ensureBucket(
      client,
      this.config.bucket,
      this.config.region
    )

    const { mimeType, dataBuffer } = splitBase64DataUri(url)

    if (!mimeType || !dataBuffer) {
      return null
    }

    const fileId = generateFileId(mimeType)

    await client.putObject(this.config.bucket, fileId, dataBuffer, {
      'Content-Type': mimeType,
    })

    return `${this.config.baseUrl}/${fileId}`
  }

  tryCreateApplicationModule() {
    const module: ApplicationModule = ({ router }) => {
      router.get(`${this.config.baseUrl}/:fileId`, async ctx => {
        const {
          params: { fileId },
        } = ctx

        try {
          const client = this.createMinioClient()
          const stream = await client.getObject(this.config.bucket, fileId)
          ctx.body = stream
        } catch {
          // unfortunately, send() exposes to much info on errors
          // so we clear it out
          ctx.body = ''
        }
      })
    }
    return module
  }
}
