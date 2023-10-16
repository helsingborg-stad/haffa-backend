import type { StartupLog } from '../types'
import { downloadEventsModule } from './api/download-events-module'
import { createEventLoggingNotifications } from './eventlogging-notifications'
import { createLogEvent } from './log-event'
import { tryCreateMongoEventLogFromEnv } from './mongo-event-log'
import { createNullEventLogService } from './null-eventlog-service'
import type { EventLogService } from './types'

export { createNullEventLogService }
export { createEventLoggingNotifications }
export { createLogEvent }
export { downloadEventsModule }

export const createEventLogServiceFromEnv = (
  startupLog: StartupLog
): EventLogService =>
  tryCreateMongoEventLogFromEnv(startupLog) || createNullEventLogService()
