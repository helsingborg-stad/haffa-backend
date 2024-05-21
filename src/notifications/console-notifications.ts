/* eslint-disable no-console */
import type { NotificationService } from './types'

export const createConsoleNotificationService = (): NotificationService => ({
  subscriptionsHasNewAdverts: async (by, adverts) =>
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
  advertWasReservedOwner: async (by, quantity, advert) =>
    console.log({
      advertWasReservedOwner: {
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
  advertReservationWasCancelledOwner: async (by, quantity, advert) =>
    console.log({
      advertReservationWasCancelledOwner: {
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
  advertWasCollectedOwner: async (by, quantity, advert) =>
    console.log({
      advertWasCollectedOwner: {
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
  advertCollectWasCancelledOwner: async (by, quantity, advert) =>
    console.log({
      advertCollectWasCancelledOwner: {
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
  advertNotReturned: async (by, quantity, advert) =>
    console.log({
      advertNotReturned: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasReturned: async (by, quantity, advert) =>
    console.log({
      advertWastReturned: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasReturnedOwner: async (by, quantity, advert) =>
    console.log({
      advertWasReturnedOwner: {
        by,
        quantity,
        advert,
      },
    }),
  advertWaitlistAvailable: async (by, quantity, advert) =>
    console.log({
      advertWaitlistAvailable: {
        by,
        quantity,
        advert,
      },
    }),
  advertWasPickedOwner: async (by, advert) =>
    console.log({
      advertWasPickedOwner: {
        by,
        advert,
      },
    }),
  advertWasUnpickedOwner: async (by, advert) =>
    console.log({
      advertWasUnpickedOwner: {
        by,
        advert,
      },
    }),
})
