import { getEnv } from "@helsingborg-stad/gdi-api-node"
import { createMongoProfileConnection } from "./mongio-profile-connection"
import { createMongoProfileRepository } from "./mongo-profile-repository"
import type { ProfileRepository } from "../types"


export const tryCreateMongoDbProfileRepositoryFromEnv = (): ProfileRepository|null => {
	const uri = getEnv('MONGODB_URI', { fallback: '' })
	const collectionName = getEnv('MONGODB_PROFILE_COLLECTION', {fallback: 'profile'})
	return uri ? createMongoProfileRepository(createMongoProfileConnection({uri, collectionName})) : null
}