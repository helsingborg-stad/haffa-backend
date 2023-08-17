import { createConsoleNotificationService } from './console-notifications'
import { tryCreateSendGridNofificationsFromEnv } from './sendgrid'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (): NotificationService => 
	tryCreateSendGridNofificationsFromEnv() || createConsoleNotificationService()

export const createNullNotificationService = (): NotificationService => ({
	pincodeRequested: async () => undefined,
	advertWasReserved: async () => undefined,
	advertReservationWasCancelled: async () => undefined,
	advertWasCollected: async () => undefined
})
