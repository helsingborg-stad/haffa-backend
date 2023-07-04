import { createConsoleNotificationService } from './console-notifications'
import type { NotificationService } from './types'

export const createNotificationServiceFromEnv = (): NotificationService => createConsoleNotificationService()

export const createNullNotificationService = (): NotificationService => ({
	advertWasReserved: async () => undefined,
	advertReservationWasCancelled: async () => undefined,
})
