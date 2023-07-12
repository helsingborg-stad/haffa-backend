import { getEnv } from "@helsingborg-stad/gdi-api-node"
import { createProfileDbConnection } from "./connection"
import { createMongoDBProfileRepository } from "./mongodb-profile-repository"
import type { ProfileRepository } from "../types"


export const tryCreateMongoDbProfileRepositoryFromEnv = (): ProfileRepository|null => {
	const uri = getEnv('MONGODB_URI', { fallback: '' })
	const collectionName = getEnv('MONGODB_PROFILE_COLLECTION', {fallback: 'profile'})
	return uri ? createMongoDBProfileRepository(createProfileDbConnection({uri, collectionName})) : null
}