import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { FilesService } from '../types'
import { createMinioFilesService } from './minio-files-service'

export const tryCreateMinioFilesServiceFromEnv = (): FilesService | null => {
  const endpoint = getEnv('MINIO_ENDPOINT', { fallback: '' })
  const port = getEnv('MINIO_PORT', { fallback: '' })
  const accessKey = getEnv('MINIO_ACCESS_KEY', { fallback: '' })
  const secretKey = getEnv('MINIO_SECRET_KEY', { fallback: '' })
  const bucket = getEnv('MINIO_BUCKET', { fallback: '' })
  const region = getEnv('MINIO_REGION', { fallback: '' })
  const useSSL = getEnv('MINIO_USE_SSL', { fallback: '' }) === 'true'

  const valid =
    !!endpoint && !!port && !!accessKey && !!secretKey && !!bucket && !!region

  return valid
    ? createMinioFilesService({
        endpoint,
        port: Number.parseInt(port, 10),
        accessKey,
        secretKey,
        bucket,
        region,
        useSSL,
      })
    : null
}
