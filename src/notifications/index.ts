import { createEventLoggingNotifications } from '../events'
import type { SettingsService } from '../settings/types'
import type { Services, StartupLog } from '../types'
import { tryCreateBrevoNotificationsFromEnv } from './brevo/brevo-notifications'
import { createCompositeNotifications } from './composite-notifications'
import { createConsoleNotificationService } from './console-notifications'
import { tryCreateDatatorgetSmsNotificationsFromEnv } from './datatorget-helsingborg-se'
import {
  tryCreateEmailUserNotifications,
  tryCreatePhoneUserNotifications,
} from './filtered-user-notifications'
import { tryCreateSendGridNofificationsFromEnv } from './sendgrid'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (
  startupLog: StartupLog,
  {
    categories,
    eventLog,
    settings,
  }: Pick<Services, 'categories' | 'eventLog' | 'settings'>
): NotificationService => {
  const email = tryCreateMailNotificationsFromEnv(startupLog)
  const sms = tryCreateSmsNotificationsFromEnv(startupLog, settings)
  const console =
    email || sms ? null : createConsoleNotificationsFromEnv(startupLog)
  return createCompositeNotifications(
    email,
    sms,
    console,
    // log events
    createEventLoggingNotifications(categories, eventLog)
  )
}

export const createNullNotificationService = (): NotificationService => ({
  subscriptionsHasNewAdverts: async () => undefined,
  pincodeRequested: async () => undefined,
  advertWasCreated: async () => undefined,
  advertWasRemoved: async () => undefined,
  advertWasArchived: async () => undefined,
  advertWasUnarchived: async () => undefined,
  advertWasReserved: async () => undefined,
  advertReservationWasCancelled: async () => undefined,
  advertWasCollected: async () => undefined,
  advertCollectWasCancelled: async () => undefined,
  advertNotCollected: async () => undefined,
  advertNotReturned: async () => undefined,
})

const tryCreateMailNotificationsFromEnv = (startupLog: StartupLog) =>
  tryCreateEmailUserNotifications(
    tryCreateSendGridNofificationsFromEnv(startupLog) ||
      tryCreateBrevoNotificationsFromEnv(startupLog)
  )

const tryCreateSmsNotificationsFromEnv = (
  startupLog: StartupLog,
  settings: SettingsService
) =>
  tryCreatePhoneUserNotifications(
    tryCreateDatatorgetSmsNotificationsFromEnv(startupLog, settings)
  )

const createConsoleNotificationsFromEnv = (startupLog: StartupLog) =>
  startupLog.echo(createConsoleNotificationService(), {
    name: 'notifications',
    config: {
      on: 'console',
    },
  })
