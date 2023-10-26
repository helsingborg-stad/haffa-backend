import type { HaffaUser } from '../login/types'

export interface AdvertSubscriptionFilter {
  search?: string
  categories?: string[]
}

export interface AdvertSubscription {
  subscriptionId: string
  lastNotifiedAt?: string
  filter: AdvertSubscriptionFilter
}

export interface SubscriptionsRepository {
  getAdvertSubscriptions: (user: HaffaUser) => Promise<AdvertSubscription[]>
  addAdvertSubscription: (
    user: HaffaUser,
    filter: AdvertSubscriptionFilter
  ) => Promise<AdvertSubscription | null>
  removeAdvertSubscription: (
    user: HaffaUser,
    subscriptionId: string
  ) => Promise<any>
}
