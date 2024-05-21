import { normalizeRoles } from '../../login'
import type { HaffaUser } from '../../login/types'
import {
  getClaimReturnInfo,
  hasCollects,
  hasReservations,
  isClaimOverdue,
} from '../advert-mutations/claims/mappers'
import { AdvertClaimType, AdvertType } from '../types'
import type { Advert, AdvertMeta } from '../types'

const hasSingleCollectClaim = ({ claims }: Advert) =>
  claims.filter(({ type }) => type === AdvertClaimType.collected).length === 1

export const getAdvertMeta = (
  advert: Advert,
  user: HaffaUser,
  now: Date = new Date()
): AdvertMeta => {
  const { type, quantity } = advert
  const mine = advert.createdBy === user.id

  const claimCount = advert.claims.reduce((s, c) => s + c.quantity, 0)
  const myClaims = advert.claims.filter(c => c.by === user.id)
  const myCollectedCount = myClaims
    .filter(c => c.type === AdvertClaimType.collected)
    .map(c => c.quantity)
    .reduce((s, v) => s + v, 0)

  const myReservationCount = myClaims
    .filter(c => c.type === AdvertClaimType.reserved)
    .map(c => c.quantity)
    .reduce((s, v) => s + v, 0)

  const isNotArchived = !advert.archivedAt
  const isArchived = !isNotArchived
  const isOnMyWaitList = advert.waitlist.includes(user.id)
  const isLendingAdvert = advert.lendingPeriod > 0
  const canBook = isLendingAdvert && quantity - claimCount > 0
  const isReservedBySome = hasReservations(advert.claims)
  const isCollectedBySome = hasCollects(advert.claims)

  const {
    canEditOwnAdverts,
    canArchiveOwnAdverts,
    canRemoveOwnAdverts,
    canReserveAdverts,
    canCollectAdverts,
    canManageOwnAdvertsHistory,
    canManageAllAdverts,
    canManageReturns,
    canJoinWaitlist,
    canManagePicked,
  } = normalizeRoles(user.roles)

  const canManageClaims =
    canManageOwnAdvertsHistory && (mine || canManageAllAdverts)

  const claims = advert.claims.map(c => ({
    ...c,
    canCancel: canManageClaims,
    canConvert: canManageClaims,
    isOverdue:
      c.type === AdvertClaimType.collected
        ? isClaimOverdue(c, advert.lendingPeriod, now)
        : false,
  }))

  if (type === AdvertType.recycle) {
    return {
      reservableQuantity: quantity - claimCount,
      collectableQuantity: myReservationCount + quantity - claimCount,
      isMine: mine,
      canEdit: canEditOwnAdverts && (mine || canManageAllAdverts),
      canArchive:
        isNotArchived && canArchiveOwnAdverts && (mine || canManageAllAdverts),
      canUnarchive:
        isArchived && canArchiveOwnAdverts && (mine || canManageAllAdverts),
      canRemove: canRemoveOwnAdverts && (mine || canManageAllAdverts),
      canBook,
      canReserve: isNotArchived && quantity > claimCount && canReserveAdverts,
      canCancelReservation: myReservationCount > 0 && canReserveAdverts,
      canCollect:
        isNotArchived &&
        (myReservationCount > 0 || quantity > claimCount) &&
        canCollectAdverts,
      canPick:
        canManagePicked && (mine || canManageAllAdverts) && !advert.pickedAt,
      canUnpick:
        canManagePicked && (mine || canManageAllAdverts) && !!advert.pickedAt,
      canJoinWaitList:
        isNotArchived &&
        canJoinWaitlist &&
        (canReserveAdverts || canCollectAdverts) &&
        quantity <= claimCount &&
        !isOnMyWaitList,
      canLeaveWaitList: isOnMyWaitList,
      canManageClaims:
        canManageOwnAdvertsHistory && (mine || canManageAllAdverts),
      canReturn: canManageReturns && hasSingleCollectClaim(advert),
      reservedyMe: myReservationCount,
      collectedByMe: myCollectedCount,
      isLendingAdvert,
      isReservedBySome,
      isCollectedBySome,
      isPicked: !!advert.pickedAt,
      returnInfo: getClaimReturnInfo(advert.claims, advert.lendingPeriod),
      claims,
    }
  }
  return {
    reservableQuantity: 0,
    collectableQuantity: 0,
    isMine: mine,
    canEdit: mine,
    canArchive:
      isNotArchived && canArchiveOwnAdverts && (mine || canManageAllAdverts),
    canUnarchive:
      isArchived && canArchiveOwnAdverts && (mine || canManageAllAdverts),
    canRemove: canRemoveOwnAdverts && (mine || canManageAllAdverts),
    canBook,
    canReserve: false,
    canCancelReservation: false,
    canCollect: false,
    canPick: false,
    canUnpick: false,
    canJoinWaitList: false,
    canLeaveWaitList: false,
    canManageClaims: false,
    canReturn: false,
    reservedyMe: myReservationCount,
    collectedByMe: myCollectedCount,
    isLendingAdvert,
    isReservedBySome,
    isCollectedBySome,
    isPicked: false,
    returnInfo: [],
    claims: [],
  }
}
