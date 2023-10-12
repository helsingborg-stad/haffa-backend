import { randomUUID } from 'crypto'
import type { Advert } from '../../adverts/types'
import type { HaffaUser } from '../../login/types'
import { createMongoConnection } from '../../mongodb-utils'
import type {
  MongoConnection,
  MongoConnectionOptions,
} from '../../mongodb-utils/types'
import type { NotificationService } from '../types'
import type { MongoEvent } from './types'
import { createMongoEvent } from './mongo-event'
import type { SettingsService } from '../../settings/types'
import { categoryAdapter } from '../../categories/category-adapter'

export const createMongoEventsConnection = ({
  uri,
  collectionName,
}: Pick<
  MongoConnectionOptions<MongoEvent>,
  'uri' | 'collectionName'
>): MongoConnection<MongoEvent> =>
  createMongoConnection({
    uri,
    collectionName,
  })

export const createMongoEventLoggingNotifications = (
  { getCollection }: MongoConnection<MongoEvent>,
  settings: SettingsService
): NotificationService => {
  const logAdvertEvent = async (
    event: string,
    {
      by,
      quantity,
      advert,
    }: { by: HaffaUser; quantity?: number; advert: Advert }
  ) =>
    (await getCollection())
      .insertOne(
        await createMongoEvent(event, {
          by,
          quantity,
          advert,
          getCategories: () => categoryAdapter(settings).getCategories(),
        })
      )
      .then(() => undefined)
  return {
    pincodeRequested: async () => undefined,
    advertWasCreated: (by, advert) =>
      logAdvertEvent('advert-was-created', { by, advert }),
    advertWasRemoved: (by, advert) =>
      logAdvertEvent('advert-was-removed', { by, advert }),
    advertWasArchived: (by, advert) =>
      logAdvertEvent('advert-was-archived', { by, advert }),
    advertWasUnarchived: (by, advert) =>
      logAdvertEvent('advert-was-unarchived', { by, advert }),
    advertWasReserved: (by, quantity, advert) =>
      logAdvertEvent('advert-was-reserved', { by, quantity, advert }),
    advertReservationWasCancelled: (by, quantity, advert) =>
      logAdvertEvent('advert-reservation-was-cancelled', {
        by,
        quantity,
        advert,
      }),
    advertWasCollected: (by, quantity, advert) =>
      logAdvertEvent('advert-was-collected', { by, quantity, advert }),
    advertCollectWasCancelled: (by, quantity, advert) =>
      logAdvertEvent('advert-collect-was-cancelled', { by, quantity, advert }),
    advertNotCollected: async () => undefined,
  }
}
