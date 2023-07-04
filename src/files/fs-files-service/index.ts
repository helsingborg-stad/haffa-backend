import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { join } from 'path'
import type { FilesService } from '../types'
import { createFsFilesService } from './fs-files-service'

export const tryCreateFsFilesServiceFromEnv = (): FilesService | null => {
  const folder = getEnv('FS_DATA_PATH', { fallback: '' })
  return folder
    ? createFsFilesService(join(process.cwd(), folder, 'files'))
    : null
}
