import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createMongoProfileConnection } from './mongo-profile-connection'
import { createMongoProfileRepository } from './mongo-profile-repository'
import type { ProfileRepository } from '../types'
import type { StartupLog } from '../../types'

export const tryCreateMongoDbProfileRepositoryFromEnv = (
  startupLog: StartupLog
): ProfileRepository | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_PROFILE_COLLECTION', {
    fallback: 'profile',
  })
  return uri
    ? startupLog.echo(
        createMongoProfileRepository(
          createMongoProfileConnection({ uri, collectionName })
        ),
        {
          name: 'profiles',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
          },
        }
      )
    : null
}
