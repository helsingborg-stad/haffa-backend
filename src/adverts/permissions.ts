import { HaffaUser } from '../login/types'
import { Advert, AdvertPermissions } from './types'

export const getAdvertPermissions = (advert: Advert, user: HaffaUser): AdvertPermissions => ({
	edit: advert.createdBy === user.id,
	delete: advert.createdBy === user.id,
	book: true,
	claim: true,
})