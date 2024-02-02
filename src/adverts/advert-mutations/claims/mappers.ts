import {
  AdvertClaimType,
  type AdvertClaim,
  type AdvertClaimEvent,
} from '../../types'

export const getLastClaimEventDate = (claim: AdvertClaim): Date => {
  const e = (a: AdvertClaimEvent, b: AdvertClaimEvent) =>
    b.at.localeCompare(a.at)

  return new Date(
    claim.events && claim.events.length > 0
      ? [...claim.events].sort(e)[0].at
      : claim.at
  )
}

export const getNextClaimEventDate = (claim: AdvertClaim, interval: number) => {
  const d = getLastClaimEventDate(claim)
  return new Date(d.setDate(d.getDate() + interval))
}

export const isClaimOverdue = (
  claim: AdvertClaim,
  lendingPeriod: number,
  compareDate: Date
) => {
  if (lendingPeriod > 0 && claim.type === AdvertClaimType.collected) {
    const expireDate = new Date(claim.at)
    expireDate.setDate(expireDate.getDate() + lendingPeriod)
    return compareDate > expireDate
  }
  return false
}
