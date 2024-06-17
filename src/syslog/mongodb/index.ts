import type { StartupLog } from '../../types'
import {
  createMongoSyslogConnection,
  createMongoSyslogService,
} from './mongodb-syslog-service'
import type { SyslogService } from '../types'
import { getEnv } from '../../lib/gdi-api-node'

export const tryCreateMongoSyslogServiceFromEnv = (
  startupLog: StartupLog
): SyslogService | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_SYSLOG_COLLECTION', {
    fallback: 'syslog',
  })
  return uri
    ? startupLog.echo(
        createMongoSyslogService(
          createMongoSyslogConnection({ uri, collectionName })
        ),
        {
          name: 'syslog',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
          },
        }
      )
    : null
}
