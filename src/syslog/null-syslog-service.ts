import { sanitizeSyslogEntry } from './mappers'
import type { SyslogService } from './types'

export const createNullSyslogService = (): SyslogService => ({
  write: async entry => sanitizeSyslogEntry(entry),
  read: async () => [],
  prune: async () => 0,
})
