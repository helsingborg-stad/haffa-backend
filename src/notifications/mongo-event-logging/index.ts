import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { StartupLog } from '../../types'
import type { NotificationService } from '../types'
import {
  createMongoEventLoggingNotifications,
  createMongoEventsConnection,
} from './mongo-event-logging-notifications'
import type { SettingsService } from '../../settings/types'

export const tryCreateMongoEventLoggingNotificationsFromEnv = (
  startupLog: StartupLog,
  settings: SettingsService
): NotificationService | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_EVENTS_COLLECTION', {
    fallback: 'events',
  })

  return uri
    ? startupLog.echo(
        createMongoEventLoggingNotifications(
          createMongoEventsConnection({ uri, collectionName }),
          settings
        ),
        {
          name: 'events',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
          },
        }
      )
    : null
}
