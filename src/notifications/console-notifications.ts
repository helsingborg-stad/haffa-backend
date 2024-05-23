/* eslint-disable no-console */
import type { Advert } from '../adverts/types'
import type { NotificationService } from './types'

const advertInfo = ({ id, createdBy, title }: Advert) => ({
  advert: { id, createdBy, title },
})

export const createConsoleNotificationService = (): NotificationService => ({
  subscriptionsHasNewAdverts: async (to, by, adverts) =>
    console.log({
      subscriptionsHasNewAdverts: {
        to,
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
        to,
        by,
        ...advertInfo(advert),
      },
    }),
  advertWasRemoved: async (to, by, advert) =>
    console.log({
      advertWasRemoved: {
        to,
        by,
        ...advertInfo(advert),
      },
    }),
  advertWasArchived: async (to, by, advert) =>
    console.log({
      advertWasArchived: {
        to,
        by,
        ...advertInfo(advert),
      },
    }),
  advertWasUnarchived: async (to, by, advert) =>
    console.log({
      advertWasUnarchived: {
        to,
        by,
        ...advertInfo(advert),
      },
    }),
  advertWasReserved: async (to, by, quantity, advert) =>
    console.log({
      advertWasReserved: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertWasReservedOwner: async (to, by, quantity, advert) =>
    console.log({
      advertWasReservedOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertReservationWasCancelled: async (to, by, quantity, advert) =>
    console.log({
      advertReservationWasCancelled: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertReservationWasCancelledOwner: async (to, by, quantity, advert) =>
    console.log({
      advertReservationWasCancelledOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertWasCollected: async (to, by, quantity, advert) =>
    console.log({
      advertWasCollected: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertWasCollectedOwner: async (to, by, quantity, advert) =>
    console.log({
      advertWasCollectedOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertCollectWasCancelled: async (to, by, quantity, advert) =>
    console.log({
      advertCollectWasCancelled: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertCollectWasCancelledOwner: async (to, by, quantity, advert) =>
    console.log({
      advertCollectWasCancelledOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertNotCollected: async (to, by, quantity, advert) =>
    console.log({
      advertNotCollected: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertNotReturned: async (to, by, quantity, advert) =>
    console.log({
      advertNotReturned: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertWasReturned: async (to, by, quantity, advert) =>
    console.log({
      advertWastReturned: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertWasReturnedOwner: async (to, by, quantity, advert) =>
    console.log({
      advertWasReturnedOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertWaitlistAvailable: async (to, by, quantity, advert) =>
    console.log({
      advertWaitlistAvailable: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
      },
    }),
  advertWasPickedOwner: async (to, by, advert) =>
    console.log({
      advertWasPickedOwner: {
        to,
        by,
        ...advertInfo(advert),
      },
    }),
  advertWasUnpickedOwner: async (to, by, advert) =>
    console.log({
      advertWasUnpickedOwner: {
        to,
        by,
        ...advertInfo(advert),
      },
    }),
})
