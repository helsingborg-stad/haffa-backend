import { advertsModule } from './adverts-module'
import { tryCreateFsAdvertsRepositoryFromEnv } from './fs-adverts-repository'
import { createInMemoryAdvertsRepository } from './in-memory-adverts-repository'
import { AdvertsRepository } from './types'

export { advertsModule }

export const createAdvertsRepositoryFromEnv = (): AdvertsRepository => tryCreateFsAdvertsRepositoryFromEnv() || createInMemoryAdvertsRepository()
