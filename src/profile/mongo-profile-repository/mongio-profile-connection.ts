import type { MongoProfile } from "./types"
import type { MongoConnection, MongoConnectionOptions } from "../../mongodb-utils/types"
import { createMongoConnection } from "../../mongodb-utils"

export const createMongoProfileConnection = ({uri, collectionName, clientFactory}: Pick<MongoConnectionOptions<MongoProfile>,'uri'|'collectionName'|'clientFactory'>): MongoConnection<MongoProfile> => createMongoConnection({
	uri,
	collectionName,
	clientFactory
})

