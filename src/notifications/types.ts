import type { Advert } from '../adverts/types'
import type { HaffaUser } from '../login/types'

export interface NotificationService {
  subscriptionsHasNewAdverts: (
    to: string,
    by: HaffaUser,
    adverts: Advert[]
  ) => Promise<void>
  pincodeRequested: (email: string, pincode: string) => Promise<void>
  advertWasCreated: (to: string, by: HaffaUser, advert: Advert) => Promise<void>
  advertWasRemoved: (to: string, by: HaffaUser, advert: Advert) => Promise<void>
  advertWasArchived: (
    to: string,
    by: HaffaUser,
    advert: Advert
  ) => Promise<void>
  advertWasUnarchived: (
    to: string,
    by: HaffaUser,
    advert: Advert
  ) => Promise<void>
  advertWasReserved: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertWasReservedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertReservationWasCancelled: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertReservationWasCancelledOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertWasCollected: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertWasCollectedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertCollectWasCancelled: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertCollectWasCancelledOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertNotCollected: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertNotReturned: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertWasReturned: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertWasReturnedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertWaitlistAvailable: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertWasPicked: (to: string, by: HaffaUser, advert: Advert) => Promise<void>
  advertWasPickedOwner: (
    to: string,
    by: HaffaUser,
    advert: Advert
  ) => Promise<void>
  advertWasUnpickedOwner: (
    to: string,
    by: HaffaUser,
    advert: Advert
  ) => Promise<void>
  advertReservationWasRenewed: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertReservationWasRenewedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertCollectWasRenewed: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertCollectWasRenewedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
}
