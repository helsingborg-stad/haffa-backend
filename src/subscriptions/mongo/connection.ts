import { createMongoConnection } from '../../mongodb-utils'
import type {
  MongoConnection,
  MongoConnectionOptions,
} from '../../mongodb-utils/types'
import type { MongoAdvertSubscription } from './types'

export const createMongoSubscriptionsConnection = ({
  uri,
  collectionName,
}: Pick<
  MongoConnectionOptions<MongoAdvertSubscription>,
  'uri' | 'collectionName'
>): MongoConnection<MongoAdvertSubscription> =>
  createMongoConnection({
    uri,
    collectionName,
    setupCollection: async c => {
      await c.createIndex({ by: 1 }, { unique: false, name: 'index__by' })
      await c.createIndex({ hash: 1 }, { unique: false, name: 'index__hash' })
    },
  })
