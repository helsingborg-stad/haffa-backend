import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { graphQLModule } from '../haffa/haffa-module'
import { tryCreateFsAdvertsRepositoryFromEnv } from './fs-adverts-repository'
import { createInMemoryAdvertsRepository } from './in-memory-adverts-repository'
import { tryCreateMongoAdvertsRepositoryFromEnv } from './mongodb-adverts-repository'
import type { AdvertsRepository } from './types'

export { graphQLModule as advertsModule }

const tryCreateFromEnvDriver = () => {
  const driver = getEnv('ADVERT_DRIVER', { fallback: '' })

  const driverMap: Record<string, () => AdvertsRepository | null> = {
    mongodb: tryCreateMongoAdvertsRepositoryFromEnv,
    fs: tryCreateFsAdvertsRepositoryFromEnv,
    memory: createInMemoryAdvertsRepository,
  }

  return driverMap[driver]?.() ?? null
}

export const createAdvertsRepositoryFromEnv = (): AdvertsRepository =>
  tryCreateFromEnvDriver() || createInMemoryAdvertsRepository()
