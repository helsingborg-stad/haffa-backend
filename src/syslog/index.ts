import type { StartupLog } from '../types'
import { tryCreateMongoSyslogServiceFromEnv } from './mongodb'
import { createNullSyslogService } from './null-syslog-service'
import type { SyslogService } from './types'

export const createSyslogServiceFromEnv = (
  startupLog: StartupLog
): SyslogService =>
  tryCreateMongoSyslogServiceFromEnv(startupLog) || createNullSyslogService()
