import { createInMemoryProfileRepository } from './in-memory-profile-repository'
import { ProfileRepository } from './types'

export { createInMemoryProfileRepository }

export const createProfileRepositoryFromEnv = (): ProfileRepository => createInMemoryProfileRepository()