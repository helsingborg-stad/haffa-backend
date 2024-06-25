import { readFile, writeFile, rm } from 'fs/promises'
import { join } from 'path'
import { mkdirp } from 'mkdirp'
import type { Profile, ProfileRepository } from './types'
import { createEmptyProfile } from './mappers'
import type { StartupLog } from '../types'
import { getEnv } from '../lib/gdi-api-node'

export const createFsProfileRepository = (
  dataFolder: string
): ProfileRepository => {
  const getProfilePath = (id: string) =>
    join(dataFolder, Buffer.from(id.toLowerCase()).toString('base64'))

  const readProfile = (id: string): Promise<Profile> =>
    readFile(getProfilePath(id), 'utf-8')
      .then(text => ({
        ...createEmptyProfile(),
        ...JSON.parse(text),
        email: id,
      }))
      .catch(e => {
        if (e.code === 'ENOENT') {
          return {
            ...createEmptyProfile(),
            email: id,
          }
        }
        throw e
      })

  const writeProfile = (id: string, profile: Profile): Promise<void> =>
    mkdirp(dataFolder).then(() =>
      writeFile(getProfilePath(id), JSON.stringify(profile, null, 2), 'utf-8')
    )
  return {
    getProfile: ({ id }) => readProfile(id),
    updateProfile: ({ id }, input) =>
      writeProfile(id, {
        ...createEmptyProfile(),
        ...input,
        email: id,
      }).then(() => readProfile(id)),
    deleteProfile: ({ id }) => rm(getProfilePath(id), { force: true }),
  }
}

export const tryCreateFsProfileRepositoryFromEnv = (
  startupLog: StartupLog
): ProfileRepository | null => {
  const dataFolder = getEnv('FS_DATA_PATH', { fallback: '' })
  return dataFolder
    ? startupLog.echo(
        createFsProfileRepository(join(process.cwd(), dataFolder, 'profiles')),
        {
          name: 'profiles',
          config: {
            on: 'fs',
            dataFolder,
          },
        }
      )
    : null
}
