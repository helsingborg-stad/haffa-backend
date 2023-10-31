import type { MongoConnection } from '../../../mongodb-utils/types'
import type { SubscriptionsRepository } from '../../types'
import type { MongoAdvertSubscription } from '../types'
import { sanitizeAdvertSubscriptionFilter } from './mappers'

export const createGetAdvertSubscriptions =
  ({
    getCollection,
  }: MongoConnection<MongoAdvertSubscription>): SubscriptionsRepository['getAdvertSubscriptions'] =>
  async user => {
    const collection = await getCollection()
    return (
      await collection
        .find({
          by: user.id,
        })
        .toArray()
    ).map(({ subscription }) => ({
      ...subscription,
      filter: sanitizeAdvertSubscriptionFilter(subscription.filter),
    }))
  }
