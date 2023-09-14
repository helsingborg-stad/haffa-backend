import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { SettingsService } from '../types'
import {
  createMongoSettingsConnection,
  createMongoSettingsService,
} from './mongodb-settings-service'
import type { StartupLog } from '../../types'

export const tryCreateMongoDbSettingsServiceFromEnv = (
  startupLog: StartupLog
): SettingsService | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_SETTINGS_COLLECTION', {
    fallback: 'settings',
  })
  return uri
    ? startupLog.echo(
        createMongoSettingsService(
          createMongoSettingsConnection({ uri, collectionName })
        ),
        {
          name: 'settings',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
          },
        }
      )
    : null
}
