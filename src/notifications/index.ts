import { tryCreateBrevoNotificationsFromEnv } from './brevo/brevo-notifications'
import { createConsoleNotificationService } from './console-notifications'
import { tryCreateSendGridNofificationsFromEnv } from './sendgrid'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (): NotificationService =>
  tryCreateSendGridNofificationsFromEnv() ||
  tryCreateBrevoNotificationsFromEnv() ||
  createConsoleNotificationService()

export const createNullNotificationService = (): NotificationService => ({
  pincodeRequested: async () => undefined,
  advertWasReserved: async () => undefined,
  advertReservationWasCancelled: async () => undefined,
  advertWasCollected: async () => undefined,
})
