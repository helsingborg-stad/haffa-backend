import request from 'superagent'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { compile } from 'handlebars'
import type { StartupLog } from '../../types'
import type { NotificationService } from '../types'
import type { SettingsService } from '../../settings/types'
import { userMapperConfigAdapter } from '../../users'

const TEMPLATES: Record<string, string> = {
  'pincode-requested': 'Din pinkod är {{pincode}}',
}

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
    console.log(to, templateId, data)

    const template = TEMPLATES[templateId] || ''
    if (!template) {
      return
    }
    const message = compile(template)(data)
    const url = new URL('/api/v1/hpb/send/sms', endpoint).toString()

    const { phone } = await userMapperConfigAdapter(
      settings
    ).getUserMapperConfig()

    console.log({
      url,
      phone,
    })
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
    advertReservationWasCancelled: (by, quantity, advert) =>
      send(by.id, 'advert-reservation-was-cancelled', { by, quantity, advert }),
    advertWasCollected: (by, quantity, advert) =>
      send(by.id, 'advert-was-collected', { by, quantity, advert }),
    advertCollectWasCancelled: (by, quantity, advert) =>
      send(by.id, 'advert-collect-was-cancelled', { by, quantity, advert }),
    advertNotCollected: (by, quantity, advert) =>
      send(by.id, 'advert-not-collected', { by, quantity, advert }),
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
            on: 'helsingborg datatoget sms',
            endpoint,
            apiKey,
          },
        }
      )
    : null
}
