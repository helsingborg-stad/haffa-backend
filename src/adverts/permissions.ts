import { Advert, AdvertPermissions, AdvertsUser } from './types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAdvertPermissions = (advert: Advert, user: AdvertsUser): AdvertPermissions => ({
	edit: advert.createdBy === user.id,
	delete: advert.createdBy === user.id,
	book: true,
	claim: true,
})