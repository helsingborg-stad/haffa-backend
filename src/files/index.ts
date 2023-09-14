import type { StartupLog } from '../types'
import { tryCreateFsFilesServiceFromEnv } from './fs-files-service'
import { tryCreateMinioFilesServiceFromEnv } from './minio-files-service'
import { createNullFileService } from './null-file-service'

export const createFilesServiceFromEnv = (startupLog: StartupLog) =>
  tryCreateMinioFilesServiceFromEnv(startupLog) ||
  tryCreateFsFilesServiceFromEnv(startupLog) ||
  startupLog.echo(createNullFileService(), {
    name: 'files',
    config: {
      on: 'memory',
    },
  })
