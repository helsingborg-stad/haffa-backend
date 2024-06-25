import { Client } from 'minio'
import mime from 'mime-types'
import ms from 'ms'
import type { FilesService } from '../types'
import { generateFileId, tryConvertDataUriToImageBuffer } from '../utils'
import { tryConvertUrlToDataUrlForLocalUrlsHelper } from '../utils/image-utils'
import type { ApplicationModule } from '../../lib/gdi-api-node'

const SEND_MAX_AGE = ms('30 days')
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

  async tryConvertUrlToDataUrl(url: string) {
    const { bucket, baseUrl } = this.config
    return tryConvertUrlToDataUrlForLocalUrlsHelper({
      url,
      baseUrl,
      mimeType: 'image/webp',
      getData: fileId => this.createMinioClient().getObject(bucket, fileId),
    })
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
          ctx.set('cache-control', `max-age=${SEND_MAX_AGE}`)
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
