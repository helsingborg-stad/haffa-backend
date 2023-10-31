import type { MongoConnection } from '../../../mongodb-utils/types'
import type { SubscriptionsRepository } from '../../types'
import type { MongoAdvertSubscription } from '../types'

export const createRemoveAdvertSubscription =
  ({
    getCollection,
  }: MongoConnection<MongoAdvertSubscription>): SubscriptionsRepository['removeAdvertSubscription'] =>
  async (user, id) => {
    const collection = await getCollection()
    const existing = await collection.findOne({
      id,
      by: user.id,
    })
    if (existing) {
      await collection.deleteOne({ id, by: user.id })
      return existing.subscription
    }
    return null
  }
