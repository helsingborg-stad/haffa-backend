import { MongoClient } from "mongodb"
import type { MongoConnection, MongoConnectionOptions } from "./types"

const once = <T>(fn: () => T): () => T => {
	let state: {result: T}|null = null
	
	return () => {
		if (state === null) {
			state = {result: fn()}
		}
		return state.result
	}
}

export const createMongoConnection = <T extends {id: string}>({uri, collectionName, setupDatabase, setupCollection}: MongoConnectionOptions<T>): MongoConnection<T> => {
	const connect = once(async () => {
		const client = await MongoClient.connect(uri)
		const db = client.db()
		const collection = db.collection<T>(collectionName)
		await collection.createIndex({id: 1}, {name: 'unique_index__id', unique: true})

		await setupDatabase?.(db)
		await setupCollection?.(collection)
		return db
	})

	return {
		getCollection: () => connect().then(db => db.collection<T>(collectionName))
	}
}
