import type { GetCategories } from '../categories/types'
import type { NotificationService } from '../notifications/types'
import { createLogEvent } from './log-event'
import type { EventLogService, LogEventContext } from './types'

export const createEventLoggingNotifications = (
  categories: GetCategories,
  eventLog: EventLogService
): NotificationService => {
  const log = async (event: string, ctx: LogEventContext) =>
    eventLog.logEvent(await createLogEvent(event, categories, ctx))

  return {
    subscriptionsHasNewAdverts: async () => undefined,
    pincodeRequested: async () => undefined,
    advertWasCreated: (by, advert) => log('advert-was-created', { by, advert }),
    advertWasRemoved: (by, advert) => log('advert-was-removed', { by, advert }),
    advertWasArchived: (by, advert) =>
      log('advert-was-archived', { by, advert }),
    advertWasUnarchived: (by, advert) =>
      log('advert-was-unarchived', { by, advert }),
    advertWasReserved: (by, quantity, advert) =>
      log('advert-was-reserved', { by, quantity, advert }),
    advertReservationWasCancelled: (by, quantity, advert) =>
      log('advert-reservation-was-cancelled', {
        by,
        quantity,
        advert,
      }),
    advertWasCollected: (by, quantity, advert) =>
      log('advert-was-collected', { by, quantity, advert }),
    advertCollectWasCancelled: (by, quantity, advert) =>
      log('advert-collect-was-cancelled', { by, quantity, advert }),
    advertNotCollected: async () => undefined,
  }
}
