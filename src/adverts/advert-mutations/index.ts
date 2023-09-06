import type { Services } from '../../types'
import type { AdvertMutations } from '../types'
import { createCancelAdvertClaim } from './cancel-advert-claim'
import { createCancelAdvertReservation } from './cancel-advert-reservation'
import { createCollectAdvert } from './collect-advert'
import { createCreateAdvert } from './create-advert'
import { createRemoveAdvert } from './remove-advert'
import { createReserveAdvert } from './reserve-advert'
import { createUpdateAdvert } from './update-advert'

export const createAdvertMutations = (
  services: Pick<Services, 'adverts' | 'files' | 'notifications'>
): AdvertMutations => ({
  createAdvert: createCreateAdvert(services),
  updateAdvert: createUpdateAdvert(services),
  removeAdvert: createRemoveAdvert(services),
  reserveAdvert: createReserveAdvert(services),
  cancelAdvertReservation: createCancelAdvertReservation(services),
  collectAdvert: createCollectAdvert(services),
  cancelAdvertClaim: createCancelAdvertClaim(services),
})
