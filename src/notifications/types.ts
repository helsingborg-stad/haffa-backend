import type { Advert } from '../adverts/types'
import type { HaffaUser } from '../login/types'

export interface NotificationService {
  subscriptionsHasNewAdverts: (
    by: HaffaUser,
    adverts: Advert[]
  ) => Promise<void>
  pincodeRequested: (email: string, pincode: string) => Promise<void>
  advertWasCreated: (by: HaffaUser, advert: Advert) => Promise<void>
  advertWasRemoved: (by: HaffaUser, advert: Advert) => Promise<void>
  advertWasArchived: (by: HaffaUser, advert: Advert) => Promise<void>
  advertWasUnarchived: (by: HaffaUser, advert: Advert) => Promise<void>
  advertWasReserved: (
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertReservationWasCancelled: (
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertWasCollected: (
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertCollectWasCancelled: (
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
  advertNotCollected: (
    by: HaffaUser,
    quantity: number,
    advert: Advert
  ) => Promise<void>
}
