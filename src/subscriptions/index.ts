import { createNullSubscriptionsRepository } from './null-subscription-repository'
import type { SubscriptionsRepository } from './types'

export { createNullSubscriptionsRepository }

export const createSubscriptionsRepositoryFromEnv =
  (): SubscriptionsRepository => createNullSubscriptionsRepository()
