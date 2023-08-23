import { getEnv } from "@helsingborg-stad/gdi-api-node";
import type { SettingsService } from "../types";
import { createMongoSettingsConnection, createMongoSettingsService } from "./mongodb-settings-service";

export const tryCreateMongoDbSettingsServiceFromEnv = (): SettingsService|null => {
	const superUser = getEnv('SUPER_USER', { fallback: '' })
	const uri = getEnv('MONGODB_URI', { fallback: '' })
	const collectionName = getEnv('MONGODB_SETTINGS_COLLECTION', {fallback: 'settings'})
	return uri 
		? createMongoSettingsService(
			superUser,
			createMongoSettingsConnection({uri, collectionName})
		)
		: null
}