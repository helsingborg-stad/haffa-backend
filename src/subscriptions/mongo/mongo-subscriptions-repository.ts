import type { MongoConnection } from '../../mongodb-utils/types'
import type { Services } from '../../types'
import type { SubscriptionsRepository } from '../types'
import { createAddAdvertSubscription } from './api/add-advert-subscription'
import { createGetAdvertSubscriptions } from './api/get-advert-subscriptions'
import { createNotifyAllSubscriptions } from './api/notify-all-subscriptions'
import { createRemoveAdvertSubscription } from './api/remove-advert-subscription'
import type { MongoAdvertSubscription } from './types'

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
