import type { Services } from '../../types'
import type { AdvertMutations } from '../types'
import { createArchiveAdvert, createUnarchiveAdvert } from './archiving'
import {
  createCancelAdvertClaim,
  createExpiredClaimsNotifier,
  createReservedClaimsNotifier,
} from './claims'
import { createConvertAdvertClaim } from './claims/convert-advert-claim'
import { createOverdueClaimsNotifier } from './claims/notify-overdue-claims'
import { createRenewAdvertClaim } from './claims/renew-advert-claim'
import { createCollectAdvert, createReturnAdvert } from './collecting'
import {
  createCreateAdvert,
  createRemoveAdvert,
  createUpdateAdvert,
} from './crud'
import { createImportAdvertSnapshot } from './crud/import-advert-snapshot'
import { createMarkAdvertAsPicked } from './picked/mark-advert-as-picked'
import { createMarkAdvertAsUnpicked } from './picked/mark-advert-as-unpicked'
import {
  createCancelAdvertReservation,
  createReserveAdvert,
} from './reservations'
import { createPatchAdvertTags } from './tags/patch-advert-tags'
import { createJoinAdvertWaitlist } from './waitlist/join-advert-waitlist'
import { createLeaveAdvertWaitlist } from './waitlist/leave-advert-waitlist'
import { createNotifyAdvertWaitlist } from './waitlist/notify-advert-waitlist'

export const createAdvertMutations = (
  services: Pick<
    Services,
    | 'getAdvertMeta'
    | 'adverts'
    | 'files'
    | 'notifications'
    | 'syslog'
    | 'workflow'
  >
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
  joinAdvertWaitlist: createJoinAdvertWaitlist(services),
  leaveAdvertWaitlist: createLeaveAdvertWaitlist(services),
  notifyAdvertWaitlist: createNotifyAdvertWaitlist(services),
  markAdvertAsPicked: createMarkAdvertAsPicked(services),
  markAdvertAsUnpicked: createMarkAdvertAsUnpicked(services),
  patchAdvertTags: createPatchAdvertTags(services),
})
