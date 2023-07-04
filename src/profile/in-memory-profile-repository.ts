import { createEmptyProfile } from './mappers'
import type { Profile, ProfileRepository } from './types'

export const createInMemoryProfileRepository = (
  db: Record<string, Profile> = {}
): ProfileRepository => ({
  getProfile: async ({ id }) =>
    db[id] || { ...createEmptyProfile(), email: id },
  updateProfile: async ({ id }, input) =>
    (db[id] = {
      ...createEmptyProfile(),
      ...input,
      email: id,
    }),
})
