import { MongoClient } from 'mongodb'
import type { MongoConnection, MongoConnectionOptions } from './types'

const once = <T, P>(fn: (p: P) => T): ((p: P) => T) => {
  let state: { result: T } | null = null

  return (p: P) => {
    if (state === null) {
      state = { result: fn(p) }
    }
    return state.result
  }
}

export const createMongoConnection = <T extends { id: string }>({
  uri,
  collectionName,
  clientFactory,
  setupClient,
  setupDatabase,
  setupCollection,
}: MongoConnectionOptions<T>): MongoConnection<T> => {
  const setupOnce = once(async (client: MongoClient) => {
    const db = client.db()
    const collection = db.collection<T>(collectionName)
    await setupClient?.(client)
    await setupDatabase?.(db)
    await setupCollection?.(collection)
  })
  const connect = async () => {
    const client = await (clientFactory?.(uri) || MongoClient.connect(uri))
    const db = client.db()
    await setupOnce(client)
    return { client, db }
  }

  return {
    getCollection: () =>
      connect().then(({ db }) => db.collection<T>(collectionName)),
    close: () => connect().then(({ client }) => client.close()),
  }
}
