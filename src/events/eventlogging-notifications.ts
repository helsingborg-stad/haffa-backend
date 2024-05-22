import type { GetCategories } from '../categories/types'
import type { NotificationService } from '../notifications/types'
import type { GetProfile } from '../profile/types'
import { createLogEvent } from './log-event'
import type { EventLogService, LogEventContext } from './types'

export const createEventLoggingNotifications = (
  categories: GetCategories,
  profiles: GetProfile,
  eventLog: EventLogService
): NotificationService => {
  const log = async (event: string, ctx: LogEventContext) =>
    eventLog.logEvent(await createLogEvent(event, profiles, categories, ctx))

  return {
    subscriptionsHasNewAdverts: async () => undefined,
    pincodeRequested: async () => undefined,
    advertWasCreated: (to, by, advert) =>
      log('advert-was-created', { by, advert }),
    advertWasRemoved: (to, by, advert) =>
      log('advert-was-removed', { by, advert }),
    advertWasArchived: (to, by, advert) =>
      log('advert-was-archived', { by, advert }),
    advertWasUnarchived: (to, by, advert) =>
      log('advert-was-unarchived', { by, advert }),
    advertWasReserved: (to, by, quantity, advert) =>
      log('advert-was-reserved', { by, quantity, advert }),
    advertWasReservedOwner: async () => undefined,
    advertReservationWasCancelled: (to, by, quantity, advert) =>
      log('advert-reservation-was-cancelled', {
        by,
        quantity,
        advert,
      }),
    advertReservationWasCancelledOwner: async () => undefined,
    advertWasCollected: (to, by, quantity, advert) =>
      log('advert-was-collected', { by, quantity, advert }),
    advertWasCollectedOwner: async () => undefined,
    advertCollectWasCancelled: (to, by, quantity, advert) =>
      log('advert-collect-was-cancelled', { by, quantity, advert }),
    advertCollectWasCancelledOwner: async () => undefined,
    advertNotCollected: async () => undefined,
    advertNotReturned: (to, by, quantity, advert) =>
      log('advert-not-returned', { by, quantity, advert }),
    advertWasReturned: (to, by, quantity, advert) =>
      log('advert-was-returned', { by, quantity, advert }),
    advertWasReturnedOwner: async () => undefined,
    advertWaitlistAvailable: async () => undefined,
    advertWasPickedOwner: async () => undefined,
    advertWasUnpickedOwner: async () => undefined,
  }
}
