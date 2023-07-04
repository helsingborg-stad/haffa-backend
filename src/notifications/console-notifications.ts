import { NotificationService } from './types'

export const createConsoleNotificationService = (): NotificationService => ({
	advertWasReserved: async (by, quantity, advert) => console.log({
		advertWasReserved: {
			by, quantity, advert,
		},
	}),
})