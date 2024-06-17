import type { FilesService } from '../types'
import { createMinioFilesService } from './minio-files-service'
import type { StartupLog } from '../../types'
import { getEnv } from '../../lib/gdi-api-node'

export const tryCreateMinioFilesServiceFromEnv = (
  startupLog: StartupLog
): FilesService | null => {
  const endpoint = getEnv('MINIO_ENDPOINT', { fallback: '' })
  const port = getEnv('MINIO_PORT', { fallback: '9000' })
  const accessKey = getEnv('MINIO_ACCESS_KEY', { fallback: '' })
  const secretKey = getEnv('MINIO_SECRET_KEY', { fallback: '' })
  const bucket = getEnv('MINIO_BUCKET', { fallback: 'haffa' })
  const region = getEnv('MINIO_REGION', { fallback: 'eu-north-1' })
  const useSSL = getEnv('MINIO_USE_SSL', { fallback: 'false' }) === 'true'

  const valid =
    !!endpoint && !!port && !!accessKey && !!secretKey && !!bucket && !!region

  return valid
    ? startupLog.echo(
        createMinioFilesService({
          endpoint,
          port: Number.parseInt(port, 10),
          accessKey,
          secretKey,
          bucket,
          region,
          useSSL,
        }),
        {
          name: 'files',
          config: {
            on: 'minio',
            endpoint,
            port,
            region,
          },
        }
      )
    : null
}
