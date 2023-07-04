import { createConsoleNotificationService } from './console-notifications'
import { NotificationService } from './types'

export const createNotificationServiceFromEnv = (): NotificationService => createConsoleNotificationService()

export const createNullNotificationService = (): NotificationService => ({
	advertWasReserved: async () => void 0,
	advertReservationWasCancelled: async () => void 0,
})
