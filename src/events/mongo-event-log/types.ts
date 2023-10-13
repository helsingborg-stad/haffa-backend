import type { LogEvent } from '../types'

export interface MongoEvent {
  id: string
  event: LogEvent
}
