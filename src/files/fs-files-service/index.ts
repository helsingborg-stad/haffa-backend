import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { FilesService } from '../types'
import { createFsFilesService } from './fs-files-service'
import { join } from 'path'

export const tryCreateFsFilesServiceFromEnv = (): FilesService => {
	const folder = getEnv('FS_DATA_PATH', { fallback: '' })
	return folder ? createFsFilesService(join(process.cwd(), folder, 'files'))	: null
}