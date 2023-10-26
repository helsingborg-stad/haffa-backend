import type { AdvertSubscription } from '../types'

export interface MongoAdvertSubscription {
  id: string
  by: string
  subscription: AdvertSubscription
}
