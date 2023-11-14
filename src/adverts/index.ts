import { graphQLModule } from '../haffa/haffa-module'
import type { StartupLog } from '../types'
import { tryCreateFsAdvertsRepositoryFromEnv } from './repository/fs'
import { createInMemoryAdvertsRepositoryFromEnv } from './repository/memory'
import { tryCreateMongoAdvertsRepositoryFromEnv } from './repository/mongo'
import type { AdvertsRepository } from './types'

export { graphQLModule as advertsModule }

export const createAdvertsRepositoryFromEnv = (
  startupLog: StartupLog
  // settings: SettingsService
): AdvertsRepository =>
  // createAdvertsRepositoryWithCategorySearch(
  //  settings,
  tryCreateMongoAdvertsRepositoryFromEnv(startupLog) ||
  tryCreateFsAdvertsRepositoryFromEnv(startupLog) ||
  createInMemoryAdvertsRepositoryFromEnv(startupLog)
// )
