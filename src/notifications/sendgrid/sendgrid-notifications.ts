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
    pincodeRequested: (email, pincode) =>
      send(email, 'pincode-requested', { email, pincode }),
    advertWasReserved: (by, quantity, advert) =>
      send(by.id, 'advert-was-reserved', { by, quantity, advert }),
    advertReservationWasCancelled: (by, quantity, advert) =>
      send(by.id, 'advert-reservation-was-cancelled', { by, quantity, advert }),
    advertWasCollected: (by, quantity, advert) =>
      send(by.id, 'advert-was-collected', { by, quantity, advert }),
    advertNotCollected: (by, quantity, advert) =>
      send(by.id, 'advert-not-collected', { by, quantity, advert }),
  }
}
