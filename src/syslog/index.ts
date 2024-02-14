import type { StartupLog } from '../types'
import { tryCreateMongoSyslogServiceFromEnv } from './mongodb'
import type { SyslogService } from './types'
import { createNullSyslogService } from './null-syslog-service'

export const createSyslogServiceFromEnv = (
  startupLog: StartupLog
): SyslogService =>
  tryCreateMongoSyslogServiceFromEnv(startupLog) || createNullSyslogService()
