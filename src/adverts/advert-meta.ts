import { HaffaUser } from '../login/types'
import { Advert, AdvertMeta, AdvertType } from './types'

export const getAdvertMeta = (advert: Advert, user: HaffaUser): AdvertMeta => ({
	canEdit: advert.createdBy === user.id,
	canDelete: advert.createdBy === user.id,
	canBook: advert.type === AdvertType.borrow,
	canReserve: advert.type == AdvertType.recycle && (
		advert.quantity > advert.reservations.map(({ quantity }) => quantity).reduce((s, v) => s + v, 0)
	),
})