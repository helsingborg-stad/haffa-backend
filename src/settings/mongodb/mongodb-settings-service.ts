import { createMongoConnection } from '../../mongodb-utils'
import type {
  MongoConnection,
  MongoConnectionOptions,
} from '../../mongodb-utils/types'
import type { SettingsService } from '../types'

export interface MongoSetting {
  id: string
  value: any
}
export const createMongoSettingsConnection = ({
  uri,
  collectionName,
}: Pick<
  MongoConnectionOptions<MongoSetting>,
  'uri' | 'collectionName'
>): MongoConnection<MongoSetting> =>
  createMongoConnection({
    uri,
    collectionName,
    setupCollection: collection =>
      collection.createIndex(
        { id: 1 },
        { unique: true, name: 'unique_index__id' }
      ),
  })

export const createMongoSettingsService = ({
  getCollection,
}: MongoConnection<MongoSetting>): SettingsService => {
  const getSetting: SettingsService['getSetting'] = async <T>(
    id: string
  ): Promise<T | null> =>
    getCollection()
      .then(collection => collection.findOne({ id }))
      .then(setting => (setting?.value || null) as T)

  const updateSetting: SettingsService['updateSetting'] = <T>(
    id: string,
    value: T
  ): Promise<T | null> =>
    getCollection()
      .then(collection =>
        collection.updateOne({ id }, { $set: { id, value } }, { upsert: true })
      )
      .then(() => getSetting(id))

  return {
    getSetting,
    updateSetting,
  }
}
