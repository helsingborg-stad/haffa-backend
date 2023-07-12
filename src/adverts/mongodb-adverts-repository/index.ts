import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { Collection, Db} from 'mongodb';
import { MongoClient } from 'mongodb';
import type { AdvertsRepository } from '../types'
import type { MongoAdvert, MongoClientFactory, MongoDBConnectionConfiguration } from './types';
import { createMongoDbAdvertsRepository } from './mongo-db-adverts-repository';

const defaultClientFactory: MongoClientFactory = {
  getClient: ({ uri }) => MongoClient.connect(uri),
}

const connect = async (
  config: MongoDBConnectionConfiguration,
  clientFactory: MongoClientFactory
): Promise<Db> => {
  const client = await clientFactory.getClient(config)
  const db = client.db()
  const collection = db.collection(config.collectionName)
  
  await collection.createIndex({ id: 1 }, { unique: true, name: 'unique_index__id' })
  await collection.createIndex({'advert.title': 'text', 'advert.description': 'text'})

  return db
}

export const createAndConfigureMongoDBAdvertsRepository = (
  config: MongoDBConnectionConfiguration,
  clientFactory: MongoClientFactory = defaultClientFactory
): AdvertsRepository => {

  let dbOnce: Promise<Db>|null = null

  const getCollection = (): Promise<Collection<MongoAdvert>> => {
    if (!dbOnce) {
      dbOnce = connect(config, clientFactory)
    }
    return dbOnce.then(db => db.collection<MongoAdvert>(config.collectionName))
  }
  
  return createMongoDbAdvertsRepository({
    getCollection,
    collation: {
      locale: 'sv',
      caseLevel: true,
    }
  })
}

export const tryCreateMongoDBAdvertsRepositoryFromEnv =
  (): AdvertsRepository | null => {
    const uri = getEnv('MONGODB_URI', { fallback: '' })
    const collectionName = getEnv('MONGODB_COLLECTION', {fallback: 'adverts'})
    return uri ? createAndConfigureMongoDBAdvertsRepository({ uri, collectionName }) : null
  }
