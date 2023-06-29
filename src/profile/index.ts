import { tryCreateFsProfileRepositoryFromEnv } from './fs-profile-repository'
import { createInMemoryProfileRepository } from './in-memory-profile-repository'
import { ProfileRepository } from './types'

export { createInMemoryProfileRepository }

export const createProfileRepositoryFromEnv = (): ProfileRepository => 
	tryCreateFsProfileRepositoryFromEnv()
	|| createInMemoryProfileRepository()