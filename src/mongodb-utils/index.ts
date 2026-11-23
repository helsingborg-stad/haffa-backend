import { MongoClient } from 'mongodb'
import type { MongoConnection, MongoConnectionOptions } from './types'

export const createMongoConnection = <T extends { id: string }>({
  uri,
  collectionName,
  clientFactory,
  setupClient,
  setupDatabase,
  setupCollection,
}: MongoConnectionOptions<T>): MongoConnection<T> => {
  let isSetup = false
  const setup = async (client: MongoClient) => {
    if (isSetup) {
      return
    }
    console.log('Setting up MongoDB client')
    const db = client.db()
    const collection = db.collection<T>(collectionName)
    await setupClient?.(client)
    await setupDatabase?.(db)
    await setupCollection?.(collection)
    isSetup = true
    console.log('MongoDB client setup complete')
  }
  const connect = async () => {
    // const client = await (clientFactory?.(uri) || MongoClient.connect(uri))
    const client = await (clientFactory?.(uri) || new MongoClient(uri))
    const db = client.db()
    await setup(client)
    return { client, db }
  }

  return {
    getCollection: () =>
      connect().then(({ db }) => db.collection<T>(collectionName)),
  }
}
