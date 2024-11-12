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
  advertWasReserved: async (to, by, quantity, advert, impersonate) =>
    console.log({
      advertWasReserved: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertWasReservedOwner: async (to, by, quantity, advert, impersonate) =>
    console.log({
      advertWasReservedOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertReservationWasCancelled: async (
    to,
    by,
    quantity,
    advert,
    impersonate
  ) =>
    console.log({
      advertReservationWasCancelled: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertReservationWasCancelledOwner: async (
    to,
    by,
    quantity,
    advert,
    impersonate
  ) =>
    console.log({
      advertReservationWasCancelledOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertWasCollected: async (to, by, quantity, advert, impersonate) =>
    console.log({
      advertWasCollected: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertWasCollectedOwner: async (to, by, quantity, advert, impersonate) =>
    console.log({
      advertWasCollectedOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertCollectWasCancelled: async (to, by, quantity, advert, impersonate) =>
    console.log({
      advertCollectWasCancelled: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertCollectWasCancelledOwner: async (
    to,
    by,
    quantity,
    advert,
    impersonate
  ) =>
    console.log({
      advertCollectWasCancelledOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
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
  advertWasPicked: async (to, by, advert) =>
    console.log({
      advertWasPicked: {
        to,
        by,
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
  advertCollectWasRenewed: async (to, by, quantity, advert, impersonate) =>
    console.log({
      advertCollectWasRenewed: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertCollectWasRenewedOwner: async (to, by, quantity, advert, impersonate) =>
    console.log({
      advertCollectWasRenewedOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertReservationWasRenewed: async (to, by, quantity, advert, impersonate) =>
    console.log({
      advertReservationWasRenewed: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
  advertReservationWasRenewedOwner: async (
    to,
    by,
    quantity,
    advert,
    impersonate
  ) =>
    console.log({
      advertReservationWasRenewedOwner: {
        to,
        by,
        quantity,
        ...advertInfo(advert),
        impersonate,
      },
    }),
})
