import type { MongoConnection } from '../../mongodb-utils/types'
import type { MongoAdvertSubscription } from './types'
import type { SubscriptionsRepository } from '../types'
import { createGetAdvertSubscriptions } from './api/get-advert-subscriptions'
import { createAddAdvertSubscription } from './api/add-advert-subscription'
import { createRemoveAdvertSubscription } from './api/remove-advert-subscription'
import { createNotifyAllSubscriptions } from './api/notify-all-subscriptions'
import type { Services } from '../../types'

export const createMongoSubscriptionsRepository = (
  connection: MongoConnection<MongoAdvertSubscription>,
  services: Pick<Services, 'adverts' | 'notifications' | 'userMapper'>
): SubscriptionsRepository => {
  const basicRepo: Omit<SubscriptionsRepository, 'notifyAllSubscriptions'> = {
    getAdvertSubscriptions: createGetAdvertSubscriptions(connection),
    addAdvertSubscription: createAddAdvertSubscription(connection),
    removeAdvertSubscription: createRemoveAdvertSubscription(connection),
  }

  return {
    ...basicRepo,
    notifyAllSubscriptions: createNotifyAllSubscriptions(
      connection,
      services,
      basicRepo
    ),
  }
}
