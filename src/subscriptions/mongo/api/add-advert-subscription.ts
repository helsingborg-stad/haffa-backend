import { randomUUID } from 'crypto'
import type { MongoConnection } from '../../../mongodb-utils/types'
import type { SubscriptionsRepository } from '../../types'
import type { MongoAdvertSubscription } from '../types'
import {
  sanitizeAdvertSubscriptionFilter,
  tryCreateSubscriptionHash,
} from './mappers'

export const createAddAdvertSubscription =
  ({
    getCollection,
  }: MongoConnection<MongoAdvertSubscription>): SubscriptionsRepository['addAdvertSubscription'] =>
  async (user, rawFilter) => {
    const filter = sanitizeAdvertSubscriptionFilter(rawFilter)
    const hash = tryCreateSubscriptionHash(user, filter)
    if (!hash) {
      return null
    }
    const collection = await getCollection()
    const existing = await collection.findOne({
      hash,
      by: user.id,
    })
    if (existing) {
      return existing.subscription
    }
    const id = randomUUID().split('-').join('')
    const added: MongoAdvertSubscription = {
      id,
      by: user.id,
      hash,
      subscription: {
        subscriptionId: id,
        createdAt: new Date().toISOString(),
        filter,
      },
    }
    await collection.insertOne(added)
    return added.subscription
  }
