import type { Advert } from '../adverts/types'
import type { HaffaUser } from '../login/types'
import type { ProfileInput } from '../profile/types'

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
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertWasReservedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertReservationWasCancelled: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertReservationWasCancelledOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertWasCollected: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertWasCollectedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertCollectWasCancelled: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertCollectWasCancelledOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
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
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertReservationWasRenewedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertCollectWasRenewed: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
  advertCollectWasRenewedOwner: (
    to: string,
    by: HaffaUser,
    quantity: number,
    advert: Advert,
    impersonate: Partial<ProfileInput> | null
  ) => Promise<void>
}
