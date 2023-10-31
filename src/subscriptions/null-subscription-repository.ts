import type { SubscriptionsRepository } from './types'

export const createNullSubscriptionsRepository =
  (): SubscriptionsRepository => ({
    getAdvertSubscriptions: async () => [],
    addAdvertSubscription: async () => null,
    removeAdvertSubscription: async () => null,
    notifyAllSubscriptions: async () => {},
  })
