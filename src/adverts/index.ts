import { advertsModule } from './adverts-module'
import { createInMemoryAdvertsRepository } from './in-memory-adverts-repository'
import { AdvertsRepository } from './types'

export { advertsModule }

export const createAdvertsRepositoryFromEnv = (): AdvertsRepository => createInMemoryAdvertsRepository()
