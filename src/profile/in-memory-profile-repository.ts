import { createEmptyProfile } from './mappers'
import type { Profile, ProfileRepository } from './types'

export const createInMemoryProfileRepository = (
  db: Record<string, Profile> = {}
): ProfileRepository => ({
  getProfile: async ({ id }) =>
    db[id] || { ...createEmptyProfile(), email: id },
  updateProfile: async ({ id }, input) => {
    // eslint-disable-next-line no-param-reassign
    db[id] = {
      ...createEmptyProfile(),
      ...input,
      email: id,
    }
    return db[id]
  },
})
