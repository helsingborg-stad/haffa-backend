import type { Collection, Db, MongoClient } from 'mongodb'

export interface MongoConnectionOptions<T extends { id: string }> {
  uri: string
  collectionName: string
  setupClient?: (client: MongoClient) => Promise<any>
  setupDatabase?: (db: Db) => Promise<any>
  setupCollection?: (collection: Collection<T>) => Promise<any>
  clientFactory?: (url: string) => Promise<MongoClient> // MongoClient['connect']
}

export interface MongoConnection<T extends { id: string }> {
  getCollection: () => Promise<Collection<T>>
  close: () => Promise<void>
}
