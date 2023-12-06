import { createMongoConnection } from '../../mongodb-utils'
import type {
  MongoConnection,
  MongoConnectionOptions,
} from '../../mongodb-utils/types'
import type { MongoViewComposition } from './types'

export const createMongoContentConnection = ({
  uri,
  collectionName,
}: Pick<
  MongoConnectionOptions<MongoViewComposition>,
  'uri' | 'collectionName'
>): MongoConnection<MongoViewComposition> =>
  createMongoConnection({
    uri,
    collectionName,
  })
