import { createMongoConnection } from '../../mongodb-utils'
import type {
  MongoConnection,
  MongoConnectionOptions,
} from '../../mongodb-utils/types'
import type { MongoEvent } from './types'

export const createMongoEventsConnection = ({
  uri,
  collectionName,
}: Pick<
  MongoConnectionOptions<MongoEvent>,
  'uri' | 'collectionName'
>): MongoConnection<MongoEvent> =>
  createMongoConnection({
    uri,
    collectionName,
  })
