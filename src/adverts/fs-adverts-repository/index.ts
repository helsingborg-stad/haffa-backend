import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { AdvertsRepository } from '../types'
import { join } from 'path'
import { createFsAdvertsRepository } from './fs-adverts-repository'

export const tryCreateFsAdvertsRepositoryFromEnv = (): AdvertsRepository|null => {
	const dataFolder = getEnv('FS_ADVERTS_PATH', { fallback: '' })
	return dataFolder ? createFsAdvertsRepository(join(process.cwd(), dataFolder)) : null
}