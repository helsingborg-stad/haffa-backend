import type { Services } from '../../types'
import type { AdvertMutations } from '../types'
import { createArchiveAdvert, createUnarchiveAdvert } from './archiving'
import {
  createReservedClaimsNotifier,
  createExpiredClaimsNotifier,
  createCancelAdvertClaim,
} from './claims'
import {
  createCancelAdvertReservation,
  createReserveAdvert,
} from './reservations'
import { createCollectAdvert, createReturnAdvert } from './collecting'
import {
  createCreateAdvert,
  createRemoveAdvert,
  createUpdateAdvert,
} from './crud'
import { createConvertAdvertClaim } from './claims/convert-advert-claim'
import { createOverdueClaimsNotifier } from './claims/notify-overdue-claims'
import { createRenewAdvertClaim } from './claims/renew-advert-claim'
import { createImportAdvertSnapshot } from './crud/import-advert-snapshot'

export const createAdvertMutations = (
  services: Pick<Services, 'adverts' | 'files' | 'notifications' | 'syslog'>
): AdvertMutations => ({
  importAdvertSnapshot: createImportAdvertSnapshot(services),
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
  renewAdvertClaim: createRenewAdvertClaim(services),
  returnAdvert: createReturnAdvert(services),
  notifyReservedClaims: createReservedClaimsNotifier(services),
  notifyExpiredClaims: createExpiredClaimsNotifier(services),
  notifyOverdueClaims: createOverdueClaimsNotifier(services),
})
