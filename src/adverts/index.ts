import { graphQLModule } from '../haffa/haffa-module'
import { tryCreateFsAdvertsRepositoryFromEnv } from './fs-adverts-repository'
import { createInMemoryAdvertsRepository } from './in-memory-adverts-repository'
import { AdvertsRepository } from './types'

export { graphQLModule as advertsModule }

export const createAdvertsRepositoryFromEnv = (): AdvertsRepository => tryCreateFsAdvertsRepositoryFromEnv() || createInMemoryAdvertsRepository()
