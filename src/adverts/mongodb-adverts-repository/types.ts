import type { Collection, MongoClient } from 'mongodb';
import type { Advert } from "../types";

export interface MongoAdvertMeta {
	unreservedCount: number
	reservedCount: number
}

export interface MongoAdvert {
	id: string
	versionId: string
	meta: MongoAdvertMeta
	advert: Advert
}

export interface MongoDBConnectionConfiguration {
  uri: string,
	collectionName: string
}

export interface MongoClientFactory {
  getClient: (config: MongoDBConnectionConfiguration) => Promise<MongoClient>
}

export interface MongoConnection {
  collection: Collection<MongoAdvert>
}
