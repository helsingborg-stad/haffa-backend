import { type Db, MongoClient } from 'mongodb'
import type { MongoConnection, MongoConnectionOptions } from './types'

export const createMongoConnection = <T extends { id: string }>({
  uri,
  collectionName,
  clientFactory,
  setupCollection,
}: MongoConnectionOptions<T>): MongoConnection<T> => {
  let sharedDbPromise: Promise<Db> | null = null

  const connect = async () => {
    sharedDbPromise ??= (async () => {
      const client = await (clientFactory?.(uri) || new MongoClient(uri))
      try {
        const db = client.db()
        const collection = db.collection<T>(collectionName)
        // enforce best practice by ensuring a unique index on the 'id' field
        await collection.createIndex(
          { id: 1 },
          { name: 'unique_index__id', unique: true }
        )
        // allow custom one time setup
        await setupCollection?.(collection)
        return db
      } catch (err) {
        await client.close().catch(() => undefined)
        throw err
      }
    })().catch(err => {
      sharedDbPromise = null
      throw err
    })

    const db = await sharedDbPromise
    return db
  }

  return {
    getCollection: () => connect().then(db => db.collection<T>(collectionName)),
  }
}
