import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { tryCreateFsFilesServiceFromEnv } from './fs-files-service'
import { tryCreateMinioFilesServiceFromEnv } from './minio-files-service'
import { createNullFileService } from './null-file-service'
import type { FilesService } from './types'

const tryCreateFromEnvDriver = () => {
  const driver = getEnv('FILE_DRIVER', { fallback: '' })

  const driverMap: Record<string, () => FilesService | null> = {
    minio: tryCreateMinioFilesServiceFromEnv,
    fs: tryCreateFsFilesServiceFromEnv,
    null: createNullFileService,
  }

  console.log('file driver', driver, driverMap[driver])

  return driverMap[driver]?.() ?? null
}

export const createFilesServiceFromEnv = () =>
  tryCreateFromEnvDriver() || createNullFileService()
