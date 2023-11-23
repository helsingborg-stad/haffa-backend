import { graphQLModule } from '../haffa/haffa-module'
import type { SettingsService } from '../settings/types'
import type { StartupLog } from '../types'
import { createAdvertsRepositoryWithCategorySearch } from './repository/category-search'
import { tryCreateFsAdvertsRepositoryFromEnv } from './repository/fs'
import { createInMemoryAdvertsRepositoryFromEnv } from './repository/memory'
import { tryCreateMongoAdvertsRepositoryFromEnv } from './repository/mongo'
import type { AdvertsRepository } from './types'

export { graphQLModule as advertsModule }

export const createAdvertsRepositoryFromEnv = (
  startupLog: StartupLog,
  settings: SettingsService
): AdvertsRepository =>
  createAdvertsRepositoryWithCategorySearch(
    settings,
    tryCreateMongoAdvertsRepositoryFromEnv(startupLog) ||
      tryCreateFsAdvertsRepositoryFromEnv(startupLog) ||
      createInMemoryAdvertsRepositoryFromEnv(startupLog)
  )
