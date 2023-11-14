import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { AdvertsRepository } from '../../types'
import type { MongoAdvert } from './types'
import { createMongoAdvertsRepository } from './mongo-db-adverts-repository'
import { createMongoConnection } from '../../../mongodb-utils'
import type { MongoConnectionOptions } from '../../../mongodb-utils/types'
import type { StartupLog } from '../../../types'

export const createAndConfigureMongoAdvertsRepository = ({
  uri,
  collectionName,
}: Pick<
  MongoConnectionOptions<MongoAdvert>,
  'uri' | 'collectionName'
>): AdvertsRepository => {
  const connection = createMongoConnection<MongoAdvert>({
    uri,
    collectionName,
    setupCollection: async c => {
      await c.createIndex({ id: 1 }, { unique: true, name: 'unique_index__id' })
      await c.createIndex({
        'advert.title': 'text',
        'advert.description': 'text',
      })
    },
  })
  return createMongoAdvertsRepository(connection, {
    locale: 'sv',
    caseLevel: true,
  })
}

export const tryCreateMongoAdvertsRepositoryFromEnv = (
  startupLog: StartupLog
): AdvertsRepository | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_ADVERTS_COLLECTION', {
    fallback: 'adverts',
  })
  return uri
    ? startupLog.echo(
        createAndConfigureMongoAdvertsRepository({ uri, collectionName }),
        {
          name: 'adverts',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
          },
        }
      )
    : null
}
