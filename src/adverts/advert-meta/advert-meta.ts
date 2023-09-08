import type { HaffaUser } from '../../login/types'
import { AdvertClaimType, AdvertType } from '../types'
import type { Advert, AdvertMeta } from '../types'

export const getAdvertMeta = (advert: Advert, user: HaffaUser): AdvertMeta => {
  const { type, quantity } = advert
  const mine = advert.createdBy === user.id
  const admin = user.roles.includes('admin')

  const claimCount = advert.claims.reduce((s, { quantity }) => s + quantity, 0)
  const myCollectedCount = advert.claims
    .filter(
      ({ by, type }) => by === user.id && type === AdvertClaimType.collected
    )
    .map(({ quantity }) => quantity)
    .reduce((s, v) => s + v, 0)

  const myReservationCount = advert.claims
    .filter(
      ({ by, type }) => by === user.id && type === AdvertClaimType.reserved
    )
    .map(({ quantity }) => quantity)
    .reduce((s, v) => s + v, 0)

  const isNotArchived = !advert.archivedAt
  const isArchived = !isNotArchived
  if (type === AdvertType.recycle) {
    return {
      reservableQuantity: quantity - claimCount,
      collectableQuantity: myReservationCount + quantity - claimCount,
      isMine: mine,
      canEdit: mine || admin,
      canArchive: isNotArchived && (mine || admin),
      canUnarchive: isArchived && (mine || admin),
      canRemove: admin,
      canBook: false, // type === AdvertType.borrow,
      canReserve: isNotArchived && quantity > claimCount,
      canCancelReservation: myReservationCount > 0,
      canCollect:
        isNotArchived && (myReservationCount > 0 || quantity > claimCount),
      canCancelClaim: mine || admin,
      reservedyMe: myReservationCount,
      collectedByMe: myCollectedCount,
      claims: mine || admin ? advert.claims : [],
    }
  }
  return {
    reservableQuantity: 0,
    collectableQuantity: 0,
    isMine: mine,
    canEdit: mine,
    canArchive: !advert.archivedAt && (mine || admin),
    canUnarchive: !!advert.archivedAt && (mine || admin),
    canRemove: admin,
    canBook: false, // type === AdvertType.borrow,
    canReserve: false,
    canCancelReservation: false,
    canCollect: false,
    canCancelClaim: false,
    reservedyMe: myReservationCount,
    collectedByMe: myCollectedCount,
    claims: [],
  }
}
