import type { Advert } from '../../../adverts/types'
import { AdvertsRepository } from '../../../adverts/types'
import { waitForAll } from '../../../lib'
import { AsyncFunc } from '../../../lib/types'
import type { HaffaUser } from '../../../login/types'
import type { MongoConnection } from '../../../mongodb-utils/types'
import type { Services } from '../../../types'
import type { AdvertSubscription, SubscriptionsRepository } from '../../types'
import type { MongoAdvertSubscription } from '../types'

// const createCollect = <T>(store)

export const createNotifyAllSubscriptions =
  (
    { getCollection }: MongoConnection<MongoAdvertSubscription>,
    {
      adverts,
      notifications,
      userMapper,
    }: Pick<Services, 'adverts' | 'notifications' | 'userMapper'>,
    {
      getAdvertSubscriptions,
    }: Omit<SubscriptionsRepository, 'notifyAllSubscriptions'>
  ): SubscriptionsRepository['notifyAllSubscriptions'] =>
  async () => {
    // given all subscriptions, get unique user emails
    const getSubscribingUserEmails = async () => {
      const collection = await getCollection()
      const users = await collection.distinct('by')
      return users
    }

    // given a subscription, find all new adverts
    const collectSubscriptionAdverts = async (
      user: HaffaUser,
      subscription: AdvertSubscription,
      found: Map<string, Advert>
    ) => {
      const { search, categories } = subscription.filter

      const ads = await adverts.list(user, {
        ...(search && { search }),

        fields: {
          createdAt: {
            gt: subscription.lastNotifiedAt || subscription.createdAt,
          },
          ...(categories &&
            categories.length && {
              category: { in: categories },
            }),
        },
        restrictions: { canBeReserved: true },
      })
      ads.adverts.forEach(advert => found.set(advert.id, advert))
    }

    // mark all user subscriptions as notified
    const markUserSubscriptionsAsNotified = async (user: HaffaUser) => {
      const collection = await getCollection()
      await collection.updateMany(
        {
          by: user.id,
        },
        {
          $set: {
            'subscription.lastNotifiedAt': new Date().toISOString(),
          },
        }
      )
    }

    // given user, find all (new) subscribed adverts, notify and mark as notified
    const notifyUser = async (user: HaffaUser) => {
      const subscriptions = await getAdvertSubscriptions(user)
      const foundAdvertsMap = new Map<string, Advert>()
      await waitForAll(subscriptions, subscription =>
        collectSubscriptionAdverts(user, subscription, foundAdvertsMap)
      )
      const foundAdverts = [...foundAdvertsMap.values()]
      if (foundAdverts.length) {
        await notifications.subscriptionsHasNewAdverts(
          user,
          foundAdverts.slice(0, 16)
        )
        await markUserSubscriptionsAsNotified(user)
      }
    }

    // fetch and validate every user with subscription
    const users = (
      await userMapper.mapAndValidateEmails(await getSubscribingUserEmails())
    ).filter(u => u.roles?.canSubscribe)

    // Notify each individual user
    await waitForAll(users, notifyUser)
  }
