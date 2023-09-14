import { graphQLModule } from '../haffa/haffa-module'
import type { StartupLog } from '../types'
import { tryCreateFsAdvertsRepositoryFromEnv } from './fs-adverts-repository'
import { createInMemoryAdvertsRepositoryFromEnv } from './in-memory-adverts-repository'
import { tryCreateMongoAdvertsRepositoryFromEnv } from './mongodb-adverts-repository'
import type { AdvertsRepository } from './types'

export { graphQLModule as advertsModule }

export const createAdvertsRepositoryFromEnv = (
  startupLog: StartupLog
): AdvertsRepository =>
  tryCreateMongoAdvertsRepositoryFromEnv(startupLog) ||
  tryCreateFsAdvertsRepositoryFromEnv(startupLog) ||
  createInMemoryAdvertsRepositoryFromEnv(startupLog)
