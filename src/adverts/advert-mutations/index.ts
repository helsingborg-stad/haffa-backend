import { Services } from '../../types'
import { AdvertMutations } from '../types'
import { createCreateAdvert } from './create-advert'
import { createReserveAdvert } from './reserve-advert'
import { createUpdateAdvert } from './update-advert'

export const createAdvertMutations = (services: Pick<Services, 'adverts'|'files'>): AdvertMutations => ({
	createAdvert: createCreateAdvert(services),
	updateAdvert: createUpdateAdvert(services),
	reserveAdvert: createReserveAdvert(services),
})