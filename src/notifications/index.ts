import { createConsoleNotificationService } from './console-notifications'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (): NotificationService => createConsoleNotificationService()

export const createNullNotificationService = (): NotificationService => ({
	pincodeRequested: async () => undefined,
	advertWasReserved: async () => undefined,
	advertReservationWasCancelled: async () => undefined,
	advertWasCollected: async () => undefined
})
