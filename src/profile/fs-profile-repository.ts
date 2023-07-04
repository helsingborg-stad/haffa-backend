import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { mkdirp } from 'mkdirp'
import type { Profile, ProfileRepository } from './types'
import { createEmptyProfile } from './mappers'

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
  }
}

export const tryCreateFsProfileRepositoryFromEnv =
  (): ProfileRepository | null => {
    const dataFolder = getEnv('FS_DATA_PATH', { fallback: '' })
    return dataFolder
      ? createFsProfileRepository(join(process.cwd(), dataFolder, 'profiles'))
      : null
  }
