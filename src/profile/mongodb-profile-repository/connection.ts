import { MongoClient } from "mongodb"
import type { MongoProfile, MongoProfileConnection } from "./types"

interface ConnectionOptions {
	uri: string, collectionName: string
}

const once = <T>(fn: () => T): () => T => {
	let state: {result: T}|null = null
	
	return () => {
		if (state === null) {
			state = {result: fn()}
		}
		return state.result
	}
}

export const createProfileDbConnection = ({uri, collectionName}: ConnectionOptions): MongoProfileConnection => {
	const connect = once(async () => {
		const client = await MongoClient.connect(uri)
		const db = client.db()
		const collection = db.collection<MongoProfile>(collectionName)
		await collection.createIndex({id: 1}, {name: 'unique_index__id', unique: true})
		return db
	})

	return {
		getCollection: () => connect().then(db => db.collection<MongoProfile>(collectionName))
	}
}
