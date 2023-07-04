import { Advert } from '../adverts/types'
import { HaffaUser } from '../login/types'

export interface NotificationService {
	advertWasReserved: (by: HaffaUser, quantity: number, advert: Advert) => Promise<void>
	advertReservationWasCancelled: (by: HaffaUser, quantity: number, advert: Advert) => Promise<void>
}