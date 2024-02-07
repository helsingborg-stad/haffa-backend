import type { Advert } from '../adverts/types'
import type { HaffaUser } from '../login/types'

export interface EventLogService {
  logEvent: (event: LogEvent) => Promise<void>
  getEvents: ({
    from,
    to,
  }: {
    from: Date | null
    to: Date | null
  }) => Promise<LogEvent[]>
  enumerate: (
    { from, to }: { from: Date; to: Date },
    inspect: (event: LogEvent) => Promise<boolean>
  ) => Promise<any>
}

export interface LogEvent {
  event: string
  at: string
  by: string
  byOrganization?: string
  quantity?: number
  organization?: string
  category?: string
  co2kg?: number
  valueByUnit?: number
}

export interface LogEventContext {
  by: HaffaUser
  quantity?: number
  advert: Advert
}
