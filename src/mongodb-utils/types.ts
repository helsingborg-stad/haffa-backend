import type { Collection, Db } from "mongodb";

export interface MongoConnectionOptions<T extends {id: string}> {
	uri: string,
	collectionName: string
	setupDatabase?: (db: Db) => Promise<any>,
	setupCollection?: (collection: Collection<T>) => Promise<any>,
}

export interface MongoConnection<T extends {id: string}> {
	getCollection: () => Promise<Collection<T>>
}