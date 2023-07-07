import type { HaffaUser } from '../login/types'
import type { Advert, AdvertMeta} from './types';
import { AdvertType } from './types'

export const getAdvertMeta = (advert: Advert, user: HaffaUser): AdvertMeta => ({
	canEdit: advert.createdBy === user.id,
	canRemove: advert.createdBy === user.id,
	canBook: advert.type === AdvertType.borrow,
	canReserve: advert.type === AdvertType.recycle && (
		advert.quantity > advert.reservations.map(({ quantity }) => quantity).reduce((s, v) => s + v, 0)
	),
	canCancelReservation: advert.reservations.some(({ reservedBy }) => reservedBy === user.id),
})