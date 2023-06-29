import { createEmptyProfile } from './mappers'
import { Profile, ProfileRepository } from './types'

export const createInMemoryProfileRepository = (db: Record<string, Profile> = {}): ProfileRepository => ({
	getProfile: async ({ id }) => db[id] || { ...createEmptyProfile(), email: id },
})