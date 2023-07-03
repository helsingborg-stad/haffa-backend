import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { join } from 'path'
import type { AdvertsRepository } from '../types'
import { createFsAdvertsRepository } from './fs-adverts-repository'

export const tryCreateFsAdvertsRepositoryFromEnv =
  (): AdvertsRepository | null => {
    const dataFolder = getEnv('FS_DATA_PATH', { fallback: '' })
    return dataFolder
      ? createFsAdvertsRepository(join(process.cwd(), dataFolder, 'adverts'))
      : null
  }
