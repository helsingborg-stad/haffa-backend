import { type Db, MongoClient } from 'mongodb'
import type { MongoConnection, MongoConnectionOptions } from './types'

export const createMongoConnection = <T extends { id: string }>({
  uri,
  collectionName,
  clientFactory,
  setupCollection,
}: MongoConnectionOptions<T>): MongoConnection<T> => {
  let isSetup = false
  const setup = async (db: Db) => {
    if (isSetup) {
      return
    }
    const collection = db.collection<T>(collectionName)
    await setupCollection?.(collection)
    isSetup = true
  }
  const connect = async () => {
    // const client = await (clientFactory?.(uri) || MongoClient.connect(uri))
    const client = await (clientFactory?.(uri) || new MongoClient(uri))
    const db = client.db()

    await setup(db)
    return db
  }

  return {
    getCollection: () => connect().then(db => db.collection<T>(collectionName)),
  }
}
