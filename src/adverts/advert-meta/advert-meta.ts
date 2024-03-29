import { normalizeRoles } from '../../login'
import type { HaffaUser } from '../../login/types'
import { isClaimOverdue } from '../advert-mutations/claims/mappers'
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
  const myCollectedCount = advert.claims
    .filter(c => c.by === user.id && c.type === AdvertClaimType.collected)
    .map(c => c.quantity)
    .reduce((s, v) => s + v, 0)

  const myReservationCount = advert.claims
    .filter(c => c.by === user.id && c.type === AdvertClaimType.reserved)
    .map(c => c.quantity)
    .reduce((s, v) => s + v, 0)

  const isNotArchived = !advert.archivedAt
  const isArchived = !isNotArchived

  const {
    canEditOwnAdverts,
    canArchiveOwnAdverts,
    canRemoveOwnAdverts,
    canReserveAdverts,
    canCollectAdverts,
    canManageOwnAdvertsHistory,
    canManageAllAdverts,
    canManageReturns,
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
      canBook: false, // type === AdvertType.borrow,
      canReserve: isNotArchived && quantity > claimCount && canReserveAdverts,
      canCancelReservation: myReservationCount > 0 && canReserveAdverts,
      canCollect:
        isNotArchived &&
        (myReservationCount > 0 || quantity > claimCount) &&
        canCollectAdverts,
      canManageClaims:
        canManageOwnAdvertsHistory && (mine || canManageAllAdverts),
      canReturn: canManageReturns && hasSingleCollectClaim(advert),
      reservedyMe: myReservationCount,
      collectedByMe: myCollectedCount,
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
    canBook: false, // type === AdvertType.borrow,
    canReserve: false,
    canCancelReservation: false,
    canCollect: false,
    canManageClaims: false,
    canReturn: false,
    reservedyMe: myReservationCount,
    collectedByMe: myCollectedCount,
    claims: [],
  }
}
