import type { GetCategories } from '../categories/types'
import { createEventLoggingNotifications } from '../events'
import { tryCreateMongoEventLogFromEnv } from '../events/mongo-event-log'
import type { SettingsService } from '../settings/types'
import type { StartupLog } from '../types'
import { tryCreateBrevoNotificationsFromEnv } from './brevo/brevo-notifications'
import { createCompositeNotifications } from './composite-notifications'
import { createConsoleNotificationService } from './console-notifications'
import { tryCreateSendGridNofificationsFromEnv } from './sendgrid'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (
  startupLog: StartupLog,
  categories: GetCategories
): NotificationService =>
  createCompositeNotifications(
    // notify by email if configured, console otherwise
    tryCreateMailNotificationsFromEnv(startupLog) ||
      createConsoleNotificationsFromEnv(startupLog),
    // log events
    tryCreateLoggingNotificationsFromEnv(startupLog, categories)
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

const tryCreateLoggingNotificationsFromEnv = (
  startupLog: StartupLog,
  categories: GetCategories
) => {
  const log = tryCreateMongoEventLogFromEnv(startupLog)
  return log ? createEventLoggingNotifications(categories, log) : null
}
const createConsoleNotificationsFromEnv = (startupLog: StartupLog) =>
  startupLog.echo(createConsoleNotificationService(), {
    name: 'notifications',
    config: {
      on: 'console',
    },
  })
