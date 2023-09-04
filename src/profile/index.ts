import { tryCreateFsProfileRepositoryFromEnv } from './fs-profile-repository'
import { createInMemoryProfileRepository } from './in-memory-profile-repository'
import { tryCreateMongoDbProfileRepositoryFromEnv } from './mongo-profile-repository'
import type { ProfileRepository } from './types'

export { createInMemoryProfileRepository }

export const createProfileRepositoryFromEnv = (): ProfileRepository =>
  tryCreateMongoDbProfileRepositoryFromEnv() ||
  tryCreateFsProfileRepositoryFromEnv() ||
  createInMemoryProfileRepository()
