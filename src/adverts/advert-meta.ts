import type { HaffaUser } from '../login/types'
import type { Advert, AdvertMeta} from './types';
import { AdvertType } from './types'

interface AdvertSummary {
	reservationCount: number
}
const summarizeAdvert = <T>(advert: Advert, map: (advert: Advert, summary: AdvertSummary) => T) => {
	const reservationCount = advert.reservations.map(({ quantity }) => quantity).reduce((s, v) => s + v, 0)
	return map(advert, {reservationCount})
}

export const getAdvertMeta = (advert: Advert, user: HaffaUser): AdvertMeta => 
	summarizeAdvert(advert, ({type, createdBy, reservations, quantity}, {reservationCount}) => ({
		reservableQuantity: type === AdvertType.recycle ? quantity - reservationCount : 0,
		canEdit: createdBy === user.id,
		canRemove: createdBy === user.id,
		canBook: type === AdvertType.borrow,
		canReserve: (type === AdvertType.recycle) && (advert.quantity > reservationCount),
		canCancelReservation: reservations.some(({ reservedBy }) => reservedBy === user.id),
	}))
