import type { Services } from '../../types'
import type { AdvertMutations } from '../types'
import { createArchiveAdvert, createUnarchiveAdvert } from './archiving'
import { createAdvertClaimNotifier, createCancelAdvertClaim } from './claims'
import {
  createCancelAdvertReservation,
  createReserveAdvert,
} from './reservations'
import { createCollectAdvert } from './collecting'
import {
  createCreateAdvert,
  createRemoveAdvert,
  createUpdateAdvert,
} from './crud'
import { createConvertAdvertClaim } from './claims/convert-advert-claim'

export const createAdvertMutations = (
  services: Pick<Services, 'adverts' | 'files' | 'notifications'>
): AdvertMutations => ({
  createAdvert: createCreateAdvert(services),
  updateAdvert: createUpdateAdvert(services),
  removeAdvert: createRemoveAdvert(services),
  reserveAdvert: createReserveAdvert(services),
  cancelAdvertReservation: createCancelAdvertReservation(services),
  collectAdvert: createCollectAdvert(services),
  archiveAdvert: createArchiveAdvert(services),
  unarchiveAdvert: createUnarchiveAdvert(services),
  cancelAdvertClaim: createCancelAdvertClaim(services),
  convertAdvertClaim: createConvertAdvertClaim(services),
  notifyAdvertClaim: createAdvertClaimNotifier(services),
})
