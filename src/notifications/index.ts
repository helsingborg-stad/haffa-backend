import { createEventLoggingNotifications } from '../events'
import type { Services, StartupLog } from '../types'
import { tryCreateBrevoNotificationsFromEnv } from './brevo/brevo-notifications'
import { createCompositeNotifications } from './composite-notifications'
import { createConsoleNotificationService } from './console-notifications'
import { tryCreateSendGridNofificationsFromEnv } from './sendgrid'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (
  startupLog: StartupLog,
  { categories, eventLog }: Pick<Services, 'categories' | 'eventLog'>
): NotificationService =>
  createCompositeNotifications(
    // notify by email if configured, console otherwise
    tryCreateMailNotificationsFromEnv(startupLog) ||
      createConsoleNotificationsFromEnv(startupLog),
    // log events
    createEventLoggingNotifications(categories, eventLog)
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
