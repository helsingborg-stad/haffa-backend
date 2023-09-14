import type { StartupLog } from '../types'
import { tryCreateFsProfileRepositoryFromEnv } from './fs-profile-repository'
import {
  createInMemoryProfileRepository,
  createInMemoryProfileRepositoryFromEnv,
} from './in-memory-profile-repository'
import { tryCreateMongoDbProfileRepositoryFromEnv } from './mongo-profile-repository'
import type { ProfileRepository } from './types'

export { createInMemoryProfileRepository }

export const createProfileRepositoryFromEnv = (
  startupLog: StartupLog
): ProfileRepository =>
  tryCreateMongoDbProfileRepositoryFromEnv(startupLog) ||
  tryCreateFsProfileRepositoryFromEnv(startupLog) ||
  createInMemoryProfileRepositoryFromEnv(startupLog)
