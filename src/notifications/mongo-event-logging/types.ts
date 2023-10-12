export interface MongoEvent {
  id: string
  at: string
  event: string
  by: string
  quantity?: number
  organization?: string
  category?: string
  co2kg?: number
}
