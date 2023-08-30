import { normalizeCategories } from "../../categories"
import type { Category } from "../../categories/types"
import { createMongoConnection } from "../../mongodb-utils"
import type { MongoConnection, MongoConnectionOptions } from "../../mongodb-utils/types"
import { normalizeLoginPolicies } from "../normalize-login-policies"
import type { LoginPolicy, SettingsService } from "../types"

export interface MongoSetting {
	id: string
	value: any 
}
export const createMongoSettingsConnection = ({uri, collectionName}: Pick<MongoConnectionOptions<MongoSetting>, 'uri'|'collectionName'>): MongoConnection<MongoSetting> => createMongoConnection({
	uri,
	collectionName,
	setupCollection: (collection) => collection.createIndex({ id: 1 }, { unique: true, name: 'unique_index__id' })
})

export const createMongoSettingsService = (superUser: string, {getCollection}: MongoConnection<MongoSetting>): SettingsService => {
	const readSetting = async <T>(id: string): Promise<T|null> => getCollection()
		.then(collection => collection.findOne({id}))
		.then(setting => (setting?.value || null) as T)

	const writeSetting = <T>(id: string, value: T): Promise<T|null> => getCollection()
		.then(collection => collection.updateOne({id}, {$set: {id, value}}, {upsert: true}))
		.then(() => readSetting(id))

	const getLoginPolicies: SettingsService['getLoginPolicies'] = () => readSetting<LoginPolicy[]>('login-policies')
		.then(normalizeLoginPolicies)

	const updateLoginPolicies: SettingsService['updateLoginPolicies'] = policies => writeSetting('login-policies', policies)
		.then(normalizeLoginPolicies)

	const getCategories: SettingsService['getCategories'] = () => readSetting<Category[]>('categories')
		.then(categories => normalizeCategories(categories || []))

	const updateCategories: SettingsService['updateCategories'] = categories => writeSetting<Category[]>('categories', categories)
		.then(getCategories)

	return {
		isSuperUser: email => !!superUser && (email === superUser),
		getLoginPolicies,
		updateLoginPolicies,
		getCategories,
		updateCategories
	}	
}