import type { StartupLog } from '../types'
import { tryCreateBrevoNotificationsFromEnv } from './brevo/brevo-notifications'
import { createConsoleNotificationService } from './console-notifications'
import { tryCreateSendGridNofificationsFromEnv } from './sendgrid'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (
  startupLog: StartupLog
): NotificationService =>
  tryCreateSendGridNofificationsFromEnv(startupLog) ||
  tryCreateBrevoNotificationsFromEnv(startupLog) ||
  startupLog.echo(createConsoleNotificationService(), {
    name: 'notifications',
    config: {
      on: 'console',
    },
  })

export const createNullNotificationService = (): NotificationService => ({
  pincodeRequested: async () => undefined,
  advertWasReserved: async () => undefined,
  advertReservationWasCancelled: async () => undefined,
  advertWasCollected: async () => undefined,
})
