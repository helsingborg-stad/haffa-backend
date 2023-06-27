import { tryCreateFsFilesServiceFromEnv } from './fs-files-service'
import { createNullFileService } from './null-file-service'

export const createFilesServiceFromEnv = () => tryCreateFsFilesServiceFromEnv() || createNullFileService()