import { createMongoConnection } from '../../mongodb-utils'
import type {
  MongoConnection,
  MongoConnectionOptions,
} from '../../mongodb-utils/types'
import type { MongoProfile } from './types'

export const createMongoProfileConnection = ({
  uri,
  collectionName,
  clientFactory,
}: Pick<
  MongoConnectionOptions<MongoProfile>,
  'uri' | 'collectionName' | 'clientFactory'
>): MongoConnection<MongoProfile> =>
  createMongoConnection({
    uri,
    collectionName,
    clientFactory,
  })
