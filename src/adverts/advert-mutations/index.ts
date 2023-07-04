import type { Services } from '../../types'
import type { AdvertMutations } from '../types'
import { createCancelAdvertReservation } from './cancel-advert-reservation'
import { createCreateAdvert } from './create-advert'
import { createReserveAdvert } from './reserve-advert'
import { createUpdateAdvert } from './update-advert'

export const createAdvertMutations = (services: Pick<Services, 'adverts'|'files'|'notifications'>): AdvertMutations => ({
	createAdvert: createCreateAdvert(services),
	updateAdvert: createUpdateAdvert(services),
	reserveAdvert: createReserveAdvert(services),
	cancelAdvertReservation: createCancelAdvertReservation(services),
})