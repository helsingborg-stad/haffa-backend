import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { StartupLog } from '../../types'
import { createMongoEventsConnection } from './connection'
import type { EventLogService } from '../types'
import { createMongoEventLogService } from './mongo-event-log-service'

export const tryCreateMongoEventLogFromEnv = (
  startupLog: StartupLog
): EventLogService | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_EVENTS_COLLECTION', {
    fallback: 'eventlog',
  })

  return uri
    ? startupLog.echo(
        createMongoEventLogService(
          createMongoEventsConnection({ uri, collectionName })
        ),
        {
          name: 'eventlog',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
          },
        }
      )
    : null
}
