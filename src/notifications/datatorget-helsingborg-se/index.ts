import request from 'superagent'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { StartupLog } from '../../types'
import type { NotificationService } from '../types'
import type { SettingsService } from '../../settings/types'
import { userMapperConfigAdapter } from '../../users'
import { smsTemplateMapper } from '../templates/sms-templates/sms-template-mapper'

const createDatatorgetSmsNotifications = ({
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
    const url = new URL('/api/v1/hpb/send/sms', endpoint).toString()
    const { phone } = await userMapperConfigAdapter(
      settings
    ).getUserMapperConfig()
    await request
      .post(url)
      .set('x-api-key', apiKey)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json')
      .send({
        data: {
          type: 'sms',
          attributes: {
            receiver: to,
            message,
            sender_id: phone.sender,
          },
        },
      })
  }

  return {
    subscriptionsHasNewAdverts: (to, by, adverts) =>
      send(by.id, 'subscriptions-has-new-adverts', { by, adverts }),
    pincodeRequested: (email, pincode) =>
      send(email, 'pincode-requested', { email, pincode }),
    advertWasCreated: async () => undefined,
    advertWasRemoved: async () => undefined,
    advertWasArchived: async () => undefined,
    advertWasUnarchived: async () => undefined,
    advertWasReserved: (to, by, quantity, advert) =>
      send(by.id, 'advert-was-reserved', { by, quantity, advert }),
    advertWasReservedOwner: (to, by, quantity, advert) =>
      send(by.id, 'advert-was-reserved-owner', { by, quantity, advert }),
    advertReservationWasCancelled: (to, by, quantity, advert) =>
      send(by.id, 'advert-reservation-was-cancelled', { by, quantity, advert }),
    advertReservationWasCancelledOwner: (to, by, quantity, advert) =>
      send(by.id, 'advert-reservation-was-cancelled-owner', {
        by,
        quantity,
        advert,
      }),
    advertWasCollected: (to, by, quantity, advert) =>
      send(by.id, 'advert-was-collected', { by, quantity, advert }),
    advertWasCollectedOwner: (to, by, quantity, advert) =>
      send(by.id, 'advert-was-collected-owner', { by, quantity, advert }),
    advertCollectWasCancelled: (to, by, quantity, advert) =>
      send(by.id, 'advert-collect-was-cancelled', { by, quantity, advert }),
    advertCollectWasCancelledOwner: (to, by, quantity, advert) =>
      send(by.id, 'advert-collect-was-cancelled-owner', {
        by,
        quantity,
        advert,
      }),
    advertNotCollected: (to, by, quantity, advert) =>
      send(by.id, 'advert-not-collected', { by, quantity, advert }),
    advertNotReturned: (to, by, quantity, advert) =>
      send(by.id, 'advert-not-returned', { by, quantity, advert }),
    advertWasReturned: (to, by, quantity, advert) =>
      send(by.id, 'advert-was-returned', { by, quantity, advert }),
    advertWasReturnedOwner: (to, by, quantity, advert) =>
      send(by.id, 'advert-was-returned-owner', { by, quantity, advert }),
    advertWaitlistAvailable: (to, by, quantity, advert) =>
      send(by.id, 'advert-waitlist-available', { by, quantity, advert }),
    advertWasPickedOwner: (to, by, advert) =>
      send(by.id, 'advert-was-picked-owner', { by, advert }),
    advertWasUnpickedOwner: (to, by, advert) =>
      send(by.id, 'advert-was-picked-owner', { by, advert }),
  }
}

export const tryCreateDatatorgetSmsNotificationsFromEnv = (
  startupLog: StartupLog,
  settings: SettingsService
): NotificationService | null => {
  const apiKey = getEnv('HELSINGBORG_DATATORGET_API_KEY', { fallback: '' })
  const endpoint = getEnv('HELSINGBORG_DATATORGET_ENDPOINT', { fallback: '' })
  return apiKey
    ? startupLog.echo(
        createDatatorgetSmsNotifications({ apiKey, endpoint, settings }),
        {
          name: 'notifications',
          config: {
            on: 'helsingborg datatorget sms',
            endpoint,
            apiKey,
          },
        }
      )
    : null
}
