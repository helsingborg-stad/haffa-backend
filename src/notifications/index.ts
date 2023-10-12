import type { SettingsService } from '../settings/types'
import type { StartupLog } from '../types'
import { tryCreateBrevoNotificationsFromEnv } from './brevo/brevo-notifications'
import { createCompositeNotifications } from './composite-notifications'
import { createConsoleNotificationService } from './console-notifications'
import { tryCreateMongoEventLoggingNotificationsFromEnv } from './mongo-event-logging'
import { tryCreateSendGridNofificationsFromEnv } from './sendgrid'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (
  startupLog: StartupLog,
  settings: SettingsService
): NotificationService =>
  createCompositeNotifications(
    // notify by email if configured, console otherwise
    tryCreateMailNotificationsFromEnv(startupLog) ||
      createConsoleNotificationsFromEnv(startupLog),
    // log events
    tryCreateMongoEventLoggingNotificationsFromEnv(startupLog, settings)
  )

export const createNullNotificationService = (): NotificationService => ({
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
})

const tryCreateMailNotificationsFromEnv = (startupLog: StartupLog) =>
  tryCreateSendGridNofificationsFromEnv(startupLog) ||
  tryCreateBrevoNotificationsFromEnv(startupLog)

const createConsoleNotificationsFromEnv = (startupLog: StartupLog) =>
  startupLog.echo(createConsoleNotificationService(), {
    name: 'notifications',
    config: {
      on: 'console',
    },
  })
