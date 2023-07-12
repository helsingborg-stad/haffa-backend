import type { MongoProfile } from "./types"
import type { MongoConnection, MongoConnectionOptions } from "../../mongodb-utils/types"
import { createMongoConnection } from "../../mongodb-utils"

export const createProfileDbConnection = ({uri, collectionName}: Pick<MongoConnectionOptions<MongoProfile>,'uri'|'collectionName'>): MongoConnection<MongoProfile> => createMongoConnection({
	uri,
	collectionName
})

