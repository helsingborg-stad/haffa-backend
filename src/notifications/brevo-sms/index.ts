import request from 'superagent'
import type { StartupLog } from '../../types'
import type { NotificationService } from '../types'
import type { SettingsService } from '../../settings/types'
import { userMapperConfigAdapter } from '../../users'
import { smsTemplateMapper } from '../templates/sms-templates/sms-template-mapper'
import { getEnv } from '../../lib/gdi-api-node'

const createBrevoSmsNotifications = ({
  apiKey,
  endpoint,
  settings,
}: {
  apiKey: string
  endpoint: string
  settings: SettingsService
}): NotificationService => {
  const send = async (
    to: string,
    templateId: string,
    data: any
  ): Promise<any> => {
    const message = await smsTemplateMapper(settings).renderTemplate(
      templateId,
      data
    )
    if (!message) {
      return
    }
    const url = new URL('/v3/transactionalSMS/sms', endpoint).toString()
    const { phone } = await userMapperConfigAdapter(
      settings
    ).getUserMapperConfig()
    await request
      .post(url)
      .set('api-key', apiKey)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json')
      .send({
        sender: phone.sender,
        recipient: to,
        content: message,
        unicodeEnabled: true,
      })
  }

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
    advertWasReservedOwner: (to, by, quantity, advert) =>
      send(to, 'advert-was-reserved-owner', { by, quantity, advert }),
    advertReservationWasCancelled: (to, by, quantity, advert) =>
      send(to, 'advert-reservation-was-cancelled', { by, quantity, advert }),
    advertReservationWasCancelledOwner: (to, by, quantity, advert) =>
      send(to, 'advert-reservation-was-cancelled-owner', {
        by,
        quantity,
        advert,
      }),
    advertWasCollected: (to, by, quantity, advert) =>
      send(to, 'advert-was-collected', { by, quantity, advert }),
    advertWasCollectedOwner: (to, by, quantity, advert) =>
      send(to, 'advert-was-collected-owner', { by, quantity, advert }),
    advertCollectWasCancelled: (to, by, quantity, advert) =>
      send(to, 'advert-collect-was-cancelled', { by, quantity, advert }),
    advertCollectWasCancelledOwner: (to, by, quantity, advert) =>
      send(to, 'advert-collect-was-cancelled-owner', {
        by,
        quantity,
        advert,
      }),
    advertNotCollected: (to, by, quantity, advert) =>
      send(to, 'advert-not-collected', { by, quantity, advert }),
    advertNotReturned: (to, by, quantity, advert) =>
      send(to, 'advert-not-returned', { by, quantity, advert }),
    advertWasReturned: (to, by, quantity, advert) =>
      send(to, 'advert-was-returned', { by, quantity, advert }),
    advertWasReturnedOwner: (to, by, quantity, advert) =>
      send(to, 'advert-was-returned-owner', { by, quantity, advert }),
    advertWaitlistAvailable: (to, by, quantity, advert) =>
      send(to, 'advert-waitlist-available', { by, quantity, advert }),
    advertWasPicked: (to, by, advert) =>
      send(to, 'advert-was-picked', { by, advert }),
    advertWasPickedOwner: (to, by, advert) =>
      send(to, 'advert-was-picked-owner', { by, advert }),
    advertWasUnpickedOwner: (to, by, advert) =>
      send(to, 'advert-was-picked-owner', { by, advert }),
    advertCollectWasRenewed: (to, by, quantity, advert) =>
      send(to, 'advert-collect-was-renewed', { by, quantity, advert }),
    advertCollectWasRenewedOwner: (to, by, quantity, advert) =>
      send(to, 'advert-collect-was-renewed-owner', { by, quantity, advert }),
    advertReservationWasRenewed: (to, by, quantity, advert) =>
      send(to, 'advert-reservation-was-renewed', { by, quantity, advert }),
    advertReservationWasRenewedOwner: (to, by, quantity, advert) =>
      send(to, 'advert-reservation-was-renewed-owner', {
        by,
        quantity,
        advert,
      }),
  }
}

export const tryCreateBrevoSmsNotificationsFromEnv = (
  startupLog: StartupLog,
  settings: SettingsService
): NotificationService | null => {
  const apiKey = getEnv('BREVO_SMS_KEY', { fallback: '' })
  const endpoint = getEnv('BREVO_ENDPOINT', { fallback: '' })
  return apiKey
    ? startupLog.echo(
        createBrevoSmsNotifications({ apiKey, endpoint, settings }),
        {
          name: 'notifications',
          config: {
            on: 'Brevo SMS',
            endpoint,
            apiKey,
          },
        }
      )
    : null
}
