import type { NotificationService } from './types'

export const createConsoleNotificationService = (): NotificationService => ({
	// eslint-disable-next-line no-console
	pincodeRequested: async (email, pincode) => console.log({
		pincodeRequested: {email, pincode}
	}),
	// eslint-disable-next-line no-console
	advertWasReserved: async (by, quantity, advert) => console.log({
		advertWasReserved: {
			by, quantity, advert,
		},
	}),
	// eslint-disable-next-line no-console
	advertReservationWasCancelled: async (by, quantity, advert) => console.log({
		advertReservationWasCancelled: {
			by, quantity, advert,
		},
	}),
	// eslint-disable-next-line no-console
	advertWasCollected: async (by, quantity, advert) => console.log({
		advertWasCollected: {
			by, quantity, advert,
		},
	})
})