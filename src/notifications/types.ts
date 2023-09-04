import type { Advert } from '../adverts/types'
import type { HaffaUser } from '../login/types'

export interface NotificationService {
  pincodeRequested: (email: string, pincode: string) => Promise<void>
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
}
