import type { Advert } from '../adverts/types'
import type { HaffaUser } from '../login/types'

export interface EventLogService {
  logEvent: (event: LogEvent) => Promise<void>
}

export interface LogEvent {
  event: string
  at: string
  by: string
  quantity?: number
  organization?: string
  category?: string
  co2kg?: number
}

export interface LogEventContext {
  by: HaffaUser
  quantity?: number
  advert: Advert
}
