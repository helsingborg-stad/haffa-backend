import type { Collection, MongoClient } from 'mongodb'

export interface MongoConnectionOptions<T extends { id: string }> {
  uri: string
  collectionName: string
  setupCollection?: (collection: Collection<T>) => Promise<any>
  clientFactory?: (url: string) => Promise<MongoClient> // MongoClient['connect']
}

export interface MongoConnection<T extends { id: string }> {
  getCollection: () => Promise<Collection<T>>
}
