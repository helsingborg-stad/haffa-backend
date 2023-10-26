import { createHash } from 'crypto'
import type { MongoConnection } from '../../mongodb-utils/types'
import type { MongoAdvertSubscription } from './types'
import type {
  AdvertSubscriptionFilter,
  SubscriptionsRepository,
} from '../types'
import type { HaffaUser } from '../../login/types'

const tryCreateSubscriptionId = (
  user: HaffaUser,
  filter: AdvertSubscriptionFilter
): string | null => {
  const keyParts = [user.id, filter.search, ...(filter.categories || [])]
    .map(v => v?.trim() || '')
    .filter(v => v)
    // eslint-disable-next-line no-nested-ternary
    .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0))

  if (keyParts.length < 2) {
    return null
  }
  return createHash('sha256').update(keyParts.join('@')).digest('hex')
}

export const createMongoSubscriptionsRepository = ({
  getCollection,
}: MongoConnection<MongoAdvertSubscription>): SubscriptionsRepository => ({
  getAdvertSubscriptions: async user => {
    const collection = await getCollection()
    return (
      await collection
        .find({
          by: user.id,
        })
        .toArray()
    ).map(({ subscription }) => subscription)
  },
  addAdvertSubscription: async (user, filter) => {
    const id = tryCreateSubscriptionId(user, filter)
    if (!id) {
      return null
    }
    const collection = await getCollection()
    const existing = await collection.findOne({
      id,
      by: user.id,
    })
    if (existing) {
      return existing.subscription
    }
    const added: MongoAdvertSubscription = {
      id,
      by: user.id,
      subscription: {
        subscriptionId: id,
        filter,
      },
    }
    await collection.insertOne(added)
    return added.subscription
  },
  removeAdvertSubscription: async (user, id) => {
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
  },
})
