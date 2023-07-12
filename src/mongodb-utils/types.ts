import type { Collection, Db } from "mongodb";

export interface MongoConnectionOptions<T extends {id: string}> {
	uri: string,
	collectionName: string
	setupDatabase?: (db: Db) => Promise<void>,
	setupCollection?: (collection: Collection<T>) => Promise<void>,
}

export interface MongoConnection<T extends {id: string}> {
	getCollection: () => Promise<Collection<T>>
}