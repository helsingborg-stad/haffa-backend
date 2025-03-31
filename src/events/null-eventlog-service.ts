import { normalizeEventFigures } from './mappers'
import type { EventLogService } from './types'

export const createNullEventLogService = (): EventLogService => ({
  logEvent: async () => {},
  enumerate: async () => {},
  getEvents: async () => [],
  getEventFigures: async () => normalizeEventFigures(),
})
