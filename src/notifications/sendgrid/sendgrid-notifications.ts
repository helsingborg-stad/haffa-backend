import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { NotificationService } from '../types'
import { createSendGridMailSender } from './sendgrid-mail-sender'
import type { SendGridConfig } from './types'
import type { StartupLog } from '../../types'

export const tryCreateSendGridNofificationsFromEnv = (
  startupLog: StartupLog
): NotificationService | null => {
  const apiKey = getEnv('SENDGRID_API_KEY', { fallback: '' })
  const from = getEnv('SENDGRID_FROM', { fallback: '' })
  return apiKey && from
    ? startupLog.echo(createSendGridNotifications({ apiKey, from }), {
        name: 'notifications',
        config: {
          on: 'sendgrid',
          from,
        },
      })
    : null
}

export const createSendGridNotifications = (
  config: SendGridConfig
): NotificationService => {
  const send = createSendGridMailSender(config)
  return {
    subscriptionsHasNewAdverts: (to, by, adverts) =>
      send(to, 'subscriptions-has-new-adverts', { by, adverts }),
    pincodeRequested: (email, pincode) =>
      send(email, 'pincode-requested', { email, pincode }),
    advertWasCreated: async () => undefined,
    advertWasRemoved: async () => undefined,
    advertWasArchived: async () => undefined,
    advertWasUnarchived: async () => undefined,
    advertWasReserved: (to, by, quantity, advert) =>
      send(to, 'advert-was-reserved', { by, quantity, advert }),
    advertWasReservedOwner: async () => undefined,
    advertReservationWasCancelled: (to, by, quantity, advert) =>
      send(to, 'advert-reservation-was-cancelled', { by, quantity, advert }),
    advertReservationWasCancelledOwner: async () => undefined,
    advertWasCollected: (to, by, quantity, advert) =>
      send(to, 'advert-was-collected', { by, quantity, advert }),
    advertWasCollectedOwner: async () => undefined,
    advertCollectWasCancelled: (to, by, quantity, advert) =>
      send(to, 'advert-collect-was-cancelled', { by, quantity, advert }),
    advertCollectWasCancelledOwner: async () => undefined,
    advertNotCollected: (to, by, quantity, advert) =>
      send(to, 'advert-not-collected', { by, quantity, advert }),
    advertNotReturned: (to, by, quantity, advert) =>
      send(to, 'advert-not-returned', { by, quantity, advert }),
    advertWasReturned: (to, by, quantity, advert) =>
      send(to, 'advert-was-returned', { by, quantity, advert }),
    advertWasReturnedOwner: (to, by, quantity, advert) =>
      send(to, 'advert-was-returned-owner', { by, quantity, advert }),
    advertWaitlistAvailable: (to, by, quantity, advert) =>
      send(to, 'advert-waitlist-avaible', { by, quantity, advert }),
    advertWasPickedOwner: (to, by, advert) =>
      send(to, 'advert-was-picked-owner', { by, advert }),
    advertWasUnpickedOwner: (to, by, advert) =>
      send(to, 'advert-was-unpicked-owner', { by, advert }),
  }
}
