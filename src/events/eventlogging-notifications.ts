import type { GetCategories } from '../categories/types'
import type { NotificationService } from '../notifications/types'
import type { GetProfile, ProfileInput } from '../profile/types'
import { createLogEvent } from './log-event'
import type { EventLogService, LogEventContext } from './types'

export const createEventLoggingNotifications = (
  categories: GetCategories,
  profiles: GetProfile,
  eventLog: EventLogService
): NotificationService => {
  const log = async (
    event: string,
    ctx: LogEventContext,
    impersonate: Partial<ProfileInput> | null
  ) =>
    eventLog.logEvent(
      await createLogEvent(event, profiles, categories, ctx, impersonate)
    )

  return {
    subscriptionsHasNewAdverts: async () => undefined,
    pincodeRequested: async () => undefined,
    advertWasCreated: (to, by, advert) =>
      log('advert-was-created', { by, advert }, null),
    advertWasRemoved: (to, by, advert) =>
      log('advert-was-removed', { by, advert }, null),
    advertWasArchived: (to, by, advert) =>
      log('advert-was-archived', { by, advert }, null),
    advertWasUnarchived: (to, by, advert) =>
      log('advert-was-unarchived', { by, advert }, null),
    advertWasReserved: (to, by, quantity, advert, impersonate) =>
      log('advert-was-reserved', { by, quantity, advert }, impersonate),
    advertWasReservedOwner: async () => undefined,
    advertReservationWasCancelled: (to, by, quantity, advert, impersonate) =>
      log(
        'advert-reservation-was-cancelled',
        {
          by,
          quantity,
          advert,
        },
        impersonate
      ),
    advertReservationWasCancelledOwner: async () => undefined,
    advertWasCollected: (to, by, quantity, advert, impersonate) =>
      log('advert-was-collected', { by, quantity, advert }, impersonate),
    advertWasCollectedOwner: async () => undefined,
    advertCollectWasCancelled: (to, by, quantity, advert, impersonate) =>
      log(
        'advert-collect-was-cancelled',
        { by, quantity, advert },
        impersonate
      ),
    advertCollectWasCancelledOwner: async () => undefined,
    advertNotCollected: async () => undefined,
    advertNotReturned: (to, by, quantity, advert) =>
      log('advert-not-returned', { by, quantity, advert }, null),
    advertWasReturned: (to, by, quantity, advert) =>
      log('advert-was-returned', { by, quantity, advert }, null),
    advertWasReturnedOwner: async () => undefined,
    advertWaitlistAvailable: async () => undefined,
    advertWasPicked: async () => undefined,
    advertWasPickedOwner: (to, by, advert) =>
      log('advert-was-picked', { by, advert }, null),
    advertWasUnpickedOwner: (to, by, advert) =>
      log('advert-was-unpicked', { by, advert }, null),
    advertCollectWasRenewed: (to, by, quantity, advert, impersonate) =>
      log('advert-collect-was-renewed', { by, quantity, advert }, impersonate),
    advertCollectWasRenewedOwner: async () => undefined,
    advertReservationWasRenewed: (to, by, quantity, advert, impersonate) =>
      log(
        'advert-reservation-was-renewed',
        { by, quantity, advert },
        impersonate
      ),
    advertReservationWasRenewedOwner: async () => undefined,
  }
}
