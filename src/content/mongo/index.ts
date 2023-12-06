import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { Services, StartupLog } from '../../types'
import type { ContentRepository } from '../types'
import { createMongoContentConnection } from './connection'
import { createMongoContentRepository } from './mongo-content-repository'

export const tryCreateMongoContentRepositoryFromEnv = (
  startupLog: StartupLog,
  services: Pick<Services, 'files'>
): ContentRepository | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_CONTENT_COLLECTION', {
    fallback: 'content',
  })

  return uri
    ? startupLog.echo(
        createMongoContentRepository(
          createMongoContentConnection({ uri, collectionName }),
          services
        ),
        {
          name: 'content',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
          },
        }
      )
    : null
}
