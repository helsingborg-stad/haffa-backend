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
    to: string,
    params: Record<string, unknown>,
    replyTo?: Identity
  ) => client.send({ name: to, email: to }, template, params, replyTo)

  return {
    subscriptionsHasNewAdverts: (to, by, adverts) =>
      send('subscriptions-has-new-adverts', to, { by, adverts }),
    pincodeRequested: (email, pincode) =>
      send('pincode-requested', email, {
        email,
        pincode,
      }),
    advertWasCreated: async () => undefined,
    advertWasRemoved: async () => undefined,
    advertWasArchived: async () => undefined,
    advertWasUnarchived: async () => undefined,
    advertWasReserved: (to, by, quantity, advert) =>
      send(
        'advert-was-reserved',
        to,
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        },
        { name: advert.createdBy, email: advert.createdBy }
      ),
    advertWasReservedOwner: (to, by, quantity, advert) =>
      send('advert-was-reserved-owner', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertReservationWasCancelled: (to, by, quantity, advert) =>
      send('advert-reservation-was-cancelled', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertReservationWasCancelledOwner: (to, by, quantity, advert) =>
      send('advert-reservation-was-cancelled-owner', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertWasCollected: (to, by, quantity, advert) =>
      send('advert-was-collected', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertWasCollectedOwner: (to, by, quantity, advert) =>
      send('advert-was-collected-owner', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertCollectWasCancelled: (to, by, quantity, advert) =>
      send('advert-collect-was-cancelled', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertCollectWasCancelledOwner: (to, by, quantity, advert) =>
      send('advert-collect-was-cancelled-owner', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertNotCollected: (to, by, quantity, advert) =>
      send(
        'advert-not-collected',
        to,
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        },
        { name: advert.createdBy, email: advert.createdBy }
      ),
    advertNotReturned: (to, by, quantity, advert) =>
      send(
        'advert-not-returned',
        to,
        {
          by,
          quantity,
          advert: stripAdvert(advert),
        },
        { name: advert.createdBy, email: advert.createdBy }
      ),
    advertWasReturned: (to, by, quantity, advert) =>
      send('advert-was-returned', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertWasReturnedOwner: (to, by, quantity, advert) =>
      send('advert-was-returned-owner', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertWaitlistAvailable: (to, by, quantity, advert) =>
      send('advert-waitlist-available', to, {
        by,
        quantity,
        advert: stripAdvert(advert),
      }),
    advertWasPicked: (to, by, advert) =>
      send('advert-was-picked', to, {
        by,
        advert: stripAdvert(advert),
      }),
    advertWasPickedOwner: (to, by, advert) =>
      send('advert-was-picked-owner', to, {
        by,
        advert: stripAdvert(advert),
      }),
    advertWasUnpickedOwner: (to, by, advert) =>
      send('advert-was-unpicked-owner', to, {
        by,
        advert: stripAdvert(advert),
      }),
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
