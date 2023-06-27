import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { FilesService } from '../types'
import { createFsFilesService } from './fs-files-service'

export const tryCreateFsFilesServiceFromEnv = (): FilesService => {
	const folder = getEnv('FS_FILES_PATH', { fallback: '' })
	return folder ? createFsFilesService(folder)	: null
}