import { Client } from 'minio'
import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import mime from 'mime-types'
import type { FilesService } from '../types'
import { generateFileId, tryConvertDataUriToImageBuffer } from '../utils'

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
      baseUrl: config.baseUrl ?? '/api/v1/minio/images',
    }
  }

  async tryCleanupUrl(url: string) {
    const match = new RegExp(`${this.config.baseUrl}/(.*)`).exec(url)
    if (match !== null) {
      const client = this.createMinioClient()
      const objectId = match[1]
      await client.removeObject(this.config.bucket, objectId)
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
    const convertedImage = await tryConvertDataUriToImageBuffer(url)
    if (!convertedImage) {
      return null
    }
    const { mimeType, buffer } = convertedImage

    const client = this.createMinioClient()
    await MinioFilesService.ensureBucket(
      client,
      this.config.bucket,
      this.config.region
    )

    const fileId = generateFileId(mimeType)

    await client.putObject(this.config.bucket, fileId, buffer, {
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
          ctx.type = mime.lookup(fileId) || 'application/octet-stream'
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
