import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { NotificationService } from '../types'
import type { Advert } from '../../adverts/types'
import { createClient } from './brevo-client'
import type { BrevoConfig } from './types'

export const createBrevoNotifications = (
  config: BrevoConfig
): NotificationService => {
  const client = createClient(config)

  const stripAdvert = (advert: Advert): Partial<Advert> => ({
    ...advert,
    images: undefined,
    claims: undefined,
  })

  return {
    pincodeRequested: (email, pincode) =>
      client.send({ name: email, email }, 'pincode-requested', {
        email,
        pincode,
      }),

    advertWasReserved: (by, quantity, advert) =>
      client.send({ name: by.id, email: by.id }, 'advert-was-reserved', {
        quantity,
        advert: stripAdvert(advert),
      }),

    advertReservationWasCancelled: (by, quantity, advert) =>
      client.send(
        { name: by.id, email: by.id },
        'advert-reservation-was-cancelled',
        {
          quantity,
          advert: stripAdvert(advert),
        }
      ),

    advertWasCollected: (by, quantity, advert) =>
      client.send({ name: by.id, email: by.id }, 'advert-was-collected', {
        quantity,
        advert: stripAdvert(advert),
      }),
  }
}

export const tryCreateBrevoNotificationsFromEnv =
  (): NotificationService | null => {
    const apiKey = getEnv('BREVO_API_KEY', { fallback: '' })
    const fromName = getEnv('BREVO_FROM_NAME', { fallback: '' })
    const fromEmail = getEnv('BREVO_FROM_EMAIL', { fallback: '' })
    return apiKey && fromName && fromEmail
      ? createBrevoNotifications({
          apiKey,
          from: { name: fromName, email: fromEmail },
        })
      : null
  }
