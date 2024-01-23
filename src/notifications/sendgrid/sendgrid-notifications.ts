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
    subscriptionsHasNewAdverts: (by, adverts) =>
      send(by.id, 'subscriptions-has-new-adverts', { by, adverts }),
    pincodeRequested: (email, pincode) =>
      send(email, 'pincode-requested', { email, pincode }),
    advertWasCreated: async () => undefined,
    advertWasRemoved: async () => undefined,
    advertWasArchived: async () => undefined,
    advertWasUnarchived: async () => undefined,
    advertWasReserved: (by, quantity, advert) =>
      send(by.id, 'advert-was-reserved', { by, quantity, advert }),
    advertWasReservedOwner: async () => undefined,
    advertReservationWasCancelled: (by, quantity, advert) =>
      send(by.id, 'advert-reservation-was-cancelled', { by, quantity, advert }),
    advertReservationWasCancelledOwner: async () => undefined,
    advertWasCollected: (by, quantity, advert) =>
      send(by.id, 'advert-was-collected', { by, quantity, advert }),
    advertWasCollectedOwner: async () => undefined,
    advertCollectWasCancelled: (by, quantity, advert) =>
      send(by.id, 'advert-collect-was-cancelled', { by, quantity, advert }),
    advertCollectWasCancelledOwner: async () => undefined,
    advertNotCollected: (by, quantity, advert) =>
      send(by.id, 'advert-not-collected', { by, quantity, advert }),
  }
}
