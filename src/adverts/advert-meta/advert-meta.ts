import type { HaffaUser } from '../../login/types'
import { AdvertClaimType, AdvertType } from '../types'
import type { Advert, AdvertMeta } from '../types'

export const getAdvertMeta = (advert: Advert, user: HaffaUser): AdvertMeta => {
  const { type, quantity } = advert
  const isMine = advert.createdBy === user.id
  const isAdmin = user.roles.includes('admin')

  const claimCount = advert.claims.reduce((s, { quantity }) => s + quantity, 0)
  const myReservationCount = advert.claims
    .filter(
      ({ by, type }) => by === user.id && type === AdvertClaimType.reserved
    )
    .map(({ quantity }) => quantity)
    .reduce((s, v) => s + v, 0)

  if (type === AdvertType.recycle) {
    return {
      reservableQuantity: quantity - claimCount,
      collectableQuantity: myReservationCount + quantity - claimCount,
      isMine,
      canEdit: isMine || isAdmin,
      canRemove: isMine || isAdmin,
      canBook: false, // type === AdvertType.borrow,
      canReserve: quantity > claimCount,
      canCancelReservation: myReservationCount > 0,
      canCollect: myReservationCount > 0 || quantity > claimCount,
      canCancelClaim: isMine || isAdmin,
      claims: isMine || isAdmin ? advert.claims : [],
    }
  }
  return {
    reservableQuantity: 0,
    collectableQuantity: 0,
    isMine,
    canEdit: isMine,
    canRemove: isMine,
    canBook: false, // type === AdvertType.borrow,
    canReserve: false,
    canCancelReservation: false,
    canCollect: false,
    canCancelClaim: false,
    claims: [],
  }
}
