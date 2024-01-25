import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { NotificationService } from '../types'
import type { Advert } from '../../adverts/types'
import { createClient } from './brevo-client'
import type { BrevoConfig, Identity, TemplateName } from './types'
import type { StartupLog } from '../../types'

export const createBrevoNotifications = (
  config: BrevoConfig
): NotificationService => {
  const client = createClient(config)

  const stripAdvert = (advert: Advert): Partial<Advert> => ({
    ...advert,
    images: undefined,
    claims: undefined,
  })

  const send = (
    template: TemplateName,
    to: Identity,
    params: Record<string, unknown>,
    replyTo?: Identity
  ) => client.send(to, template, params, replyTo)

  const all = (...promises: Promise<void>[]) =>
    Promise.all(promises).then(() => undefined)

  return {
    subscriptionsHasNewAdverts: (by, adverts) =>
      send(
        'subscriptions-has-new-adverts',
        { name: by.id, email: by.id },
        { by, adverts }
      ),
    pincodeRequested: (email, pincode) =>
      send(
        'pincode-requested',
        { name: email, email },
        {
          email,
          pincode,
        }
      ),
    advertWasCreated: async () => undefined,
    advertWasRemoved: async () => undefined,
    advertWasArchived: async () => undefined,
    advertWasUnarchived: async () => undefined,
    advertWasReserved: (by, quantity, advert) =>
      send(
        'advert-was-reserved',
        { name: by.id, email: by.id },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        },
        { name: advert.createdBy, email: advert.createdBy }
      ),
    advertWasReservedOwner: (by, quantity, advert) =>
      send(
        'advert-was-reserved-owner',
        { email: advert.createdBy, name: advert.createdBy },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
    advertReservationWasCancelled: (by, quantity, advert) =>
      send(
        'advert-reservation-was-cancelled',
        { name: by.id, email: by.id },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
    advertReservationWasCancelledOwner: (by, quantity, advert) =>
      send(
        'advert-reservation-was-cancelled-owner',
        { name: advert.createdBy, email: advert.createdBy },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
    advertWasCollected: (by, quantity, advert) =>
      send(
        'advert-was-collected',
        { name: by.id, email: by.id },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
    advertWasCollectedOwner: (by, quantity, advert) =>
      send(
        'advert-was-collected-owner',
        { name: advert.createdBy, email: advert.createdBy },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
    advertCollectWasCancelled: (by, quantity, advert) =>
      send(
        'advert-collect-was-cancelled',
        { name: by.id, email: by.id },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
    advertCollectWasCancelledOwner: (by, quantity, advert) =>
      send(
        'advert-collect-was-cancelled-owner',
        { name: advert.createdBy, email: advert.createdBy },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
    advertNotCollected: (by, quantity, advert) =>
      send(
        'advert-not-collected',
        { name: by.id, email: by.id },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
    advertNotReturned: (by, quantity, advert) =>
      send(
        'advert-not-returned',
        { name: by.id, email: by.id },
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        }
      ),
  }
}

export const tryCreateBrevoNotificationsFromEnv = (
  startupLog: StartupLog
): NotificationService | null => {
  const apiKey = getEnv('BREVO_API_KEY', { fallback: '' })
  const fromName = getEnv('BREVO_FROM_NAME', { fallback: '' })
  const fromEmail = getEnv('BREVO_FROM_EMAIL', { fallback: '' })
  return apiKey && fromName && fromEmail
    ? startupLog.echo(
        createBrevoNotifications({
          apiKey,
          from: { name: fromName, email: fromEmail },
        }),
        {
          name: 'notifications',
          config: {
            on: 'brevo',
            fromName,
            fromEmail,
          },
        }
      )
    : null
}
