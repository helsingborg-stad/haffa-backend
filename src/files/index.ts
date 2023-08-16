import { tryCreateFsFilesServiceFromEnv } from './fs-files-service'
import { tryCreateMinioFilesServiceFromEnv } from './minio-files-service'
import { createNullFileService } from './null-file-service'
import type { FilesService } from './types'

export const createFilesServiceFromEnv = () => tryCreateMinioFilesServiceFromEnv() || tryCreateFsFilesServiceFromEnv() || createNullFileService()
