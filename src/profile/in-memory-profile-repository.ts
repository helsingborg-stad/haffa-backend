import type { StartupLog } from '../types'
import { createEmptyProfile } from './mappers'
import type { Profile, ProfileRepository } from './types'

export const createInMemoryProfileRepositoryFromEnv = (
  startupLog: StartupLog
) =>
  startupLog.echo(createInMemoryProfileRepository(), {
    name: 'profiles',
    config: {
      on: 'memory',
    },
  })

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
  deleteProfile: async ({ id }) => {
    // eslint-disable-next-line no-param-reassign
    delete db[id]
  },
})
