/* eslint-disable no-console */
import type { NotificationService } from './types'

export const createConsoleNotificationService = (): NotificationService => ({
  pincodeRequested: async (email, pincode) =>
    console.log({
      pincodeRequested: { email, pincode },
    }),
  advertWasReserved: async (by, quantity, advert) =>
    console.log({
      advertWasReserved: {
        by,
        quantity,
        advert,
      },
    }),
  advertReservationWasCancelled: async (by, quantity, advert) =>
    console.log({
      advertReservationWasCancelled: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasCollected: async (by, quantity, advert) =>
    console.log({
      advertWasCollected: {
        by,
        quantity,
        advert,
      },
    }),
  advertCollectWasCancelled: async (by, quantity, advert) =>
    console.log({
      advertCollectWasCancelled: {
        by,
        quantity,
        advert,
      },
    }),
  advertNotCollected: async (by, quantity, advert) =>
    console.log({
      advertNotCollected: {
        by,
        quantity,
        advert,
      },
    }),
})
