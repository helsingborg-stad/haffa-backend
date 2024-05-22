/* eslint-disable no-console */
import type { NotificationService } from './types'

export const createConsoleNotificationService = (): NotificationService => ({
  subscriptionsHasNewAdverts: async (to, by, adverts) =>
    console.log({
      subscriptionsHasNewAdverts: {
        by,
        adverts,
      },
    }),
  pincodeRequested: async (email, pincode) =>
    console.log({
      pincodeRequested: { email, pincode },
    }),
  advertWasCreated: async (to, by, advert) =>
    console.log({
      advertWasCreated: {
        by,
        advert,
      },
    }),
  advertWasRemoved: async (to, by, advert) =>
    console.log({
      advertWasRemoved: {
        by,
        advert,
      },
    }),
  advertWasArchived: async (to, by, advert) =>
    console.log({
      advertWasArchived: {
        by,
        advert,
      },
    }),
  advertWasUnarchived: async (to, by, advert) =>
    console.log({
      advertWasUnarchived: {
        by,
        advert,
      },
    }),
  advertWasReserved: async (to, by, quantity, advert) =>
    console.log({
      advertWasReserved: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasReservedOwner: async (to, by, quantity, advert) =>
    console.log({
      advertWasReservedOwner: {
        by,
        quantity,
        advert,
      },
    }),
  advertReservationWasCancelled: async (to, by, quantity, advert) =>
    console.log({
      advertReservationWasCancelled: {
        by,
        quantity,
        advert,
      },
    }),
  advertReservationWasCancelledOwner: async (to, by, quantity, advert) =>
    console.log({
      advertReservationWasCancelledOwner: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasCollected: async (to, by, quantity, advert) =>
    console.log({
      advertWasCollected: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasCollectedOwner: async (to, by, quantity, advert) =>
    console.log({
      advertWasCollectedOwner: {
        by,
        quantity,
        advert,
      },
    }),
  advertCollectWasCancelled: async (to, by, quantity, advert) =>
    console.log({
      advertCollectWasCancelled: {
        by,
        quantity,
        advert,
      },
    }),
  advertCollectWasCancelledOwner: async (to, by, quantity, advert) =>
    console.log({
      advertCollectWasCancelledOwner: {
        by,
        quantity,
        advert,
      },
    }),
  advertNotCollected: async (to, by, quantity, advert) =>
    console.log({
      advertNotCollected: {
        by,
        quantity,
        advert,
      },
    }),
  advertNotReturned: async (to, by, quantity, advert) =>
    console.log({
      advertNotReturned: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasReturned: async (to, by, quantity, advert) =>
    console.log({
      advertWastReturned: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasReturnedOwner: async (to, by, quantity, advert) =>
    console.log({
      advertWasReturnedOwner: {
        by,
        quantity,
        advert,
      },
    }),
  advertWaitlistAvailable: async (to, by, quantity, advert) =>
    console.log({
      advertWaitlistAvailable: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasPickedOwner: async (to, by, advert) =>
    console.log({
      advertWasPickedOwner: {
        by,
        advert,
      },
    }),
  advertWasUnpickedOwner: async (to, by, advert) =>
    console.log({
      advertWasUnpickedOwner: {
        by,
        advert,
      },
    }),
})
