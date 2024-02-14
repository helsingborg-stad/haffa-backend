import * as uuid from 'uuid'
import { Severity, type SyslogEntry, type SyslogFilter } from './types'

export const sanitizeSyslogFilter = (filter: SyslogFilter = {}) => ({
  ...filter,
  skip: filter.skip && filter.skip >= 0 ? filter.skip : 0,
  limit: filter.limit && filter.limit > 0 ? filter.limit : 50,
})

export const sanitizeSyslogEntry = (
  entry: Partial<SyslogEntry>
): SyslogEntry => ({
  id: uuid.v4().split('-').join(''),
  at: new Date().toISOString(),
  by: 'N/A',
  message: 'N/A',
  type: 'N/A',
  ...entry,
  severity: Math.max(-1, entry.severity ?? Severity.info),
})
