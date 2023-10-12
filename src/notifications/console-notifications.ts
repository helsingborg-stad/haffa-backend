/* eslint-disable no-console */
import type { NotificationService } from './types'

export const createConsoleNotificationService = (): NotificationService => ({
  pincodeRequested: async (email, pincode) =>
    console.log({
      pincodeRequested: { email, pincode },
    }),
  advertWasCreated: async (by, advert) =>
    console.log({
      advertWasCreated: {
        by,
        advert,
      },
    }),
  advertWasRemoved: async (by, advert) =>
    console.log({
      advertWasRemoved: {
        by,
        advert,
      },
    }),
  advertWasArchived: async (by, advert) =>
    console.log({
      advertWasArchived: {
        by,
        advert,
      },
    }),
  advertWasUnarchived: async (by, advert) =>
    console.log({
      advertWasUnarchived: {
        by,
        advert,
      },
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
