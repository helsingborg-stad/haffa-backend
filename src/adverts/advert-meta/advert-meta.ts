import type { HaffaUser } from '../../login/types'
import { AdvertType} from '../types';
import type { Advert, AdvertMeta} from '../types';

export const getAdvertMeta = (advert: Advert, user: HaffaUser): AdvertMeta => {
	const {type, quantity} = advert
	const isMine = advert.createdBy === user.id
	const reservationCount = advert.reservations
		.map(({ quantity }) => quantity)
		.reduce((s, v) => s + v, 0)
	const collectCount = advert.collects
		.map(({ quantity }) => quantity)
		.reduce((s, v) => s + v, 0)
	const myReservationCount = advert.reservations
		.filter(({ reservedBy }) => reservedBy === user.id)
		.map(({ quantity }) => quantity)
		.reduce((s, v) => s + v, 0)
	const myCollectCount = advert.collects
		.filter(({ collectedBy }) => collectedBy === user.id)
		.map(({ quantity }) => quantity)
		.reduce((s, v) => s + v, 0)

	if (type === AdvertType.recycle) {
		return {
			reservableQuantity: quantity - reservationCount,
			canEdit: isMine,
			canRemove: isMine,
			canBook: false, // type === AdvertType.borrow,
			canReserve: quantity > reservationCount,
			canCancelReservation: myReservationCount > myCollectCount,
			canCollect: 
					(
						(quantity > reservationCount) // advert has free reservations
						&& (quantity > collectCount)
					)
					|| (myReservationCount > myCollectCount) // I have pending reservations
		}
	}
	return {
		reservableQuantity: 0,
		canEdit: isMine,
		canRemove: isMine,
		canBook: false, // type === AdvertType.borrow,
		canReserve: false,
		canCancelReservation: false,
		canCollect: false 
	}
}
