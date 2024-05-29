import { AdvertClaimType } from '../../types'
import type {
  AdvertReturnInfo,
  AdvertClaim,
  AdvertClaimEvent,
} from '../../types'

const sanitizeInterval = (interval: number) => (interval < 0 ? 0 : interval)
/**
 * Returns the date when the last event was generated
 * e.g when the last reminder was sent
 * @param claim A refereence to an AdvertClaim
 * @returns A date object
 */
export const getLastClaimEventDate = (claim: AdvertClaim): Date => {
  // Sort by date callback
  const e = (a: AdvertClaimEvent, b: AdvertClaimEvent) =>
    b.at.localeCompare(a.at)

  // If no events are logged, return the date
  // of the claim itself as it represents the
  // time of the latest status change
  return new Date(
    claim.events && claim.events.length > 0
      ? [...claim.events].sort(e)[0].at
      : claim.at
  )
}

/**
 * Given an interval, calculate when, at the earliest
 * the next event is allowed to be logged
 * @param claim A reference to an AdvertClaim
 * @param interval The number of days that should occur before a new event is logged
 * @returns A Date object
 */
export const getNextClaimEventDate = (claim: AdvertClaim, interval: number) => {
  const d = getLastClaimEventDate(claim)
  return new Date(d.setDate(d.getDate() + sanitizeInterval(interval)))
}

/**
 * Calculates the status of a claim given that it has a limited validity
 *
 * @param claim A reference to an AdvertClaim
 * @param daysValid The number of days from the latest status change the claim is valid
 * @param now The current date and time to validate towards
 * @returns true if the claim is invalid, otherwise false
 */
export const isClaimOverdue = (
  claim: AdvertClaim,
  daysValid: number,
  now: Date
) => {
  if (daysValid > 0) {
    const expireDate = new Date(claim.at)
    expireDate.setDate(expireDate.getDate() + sanitizeInterval(daysValid))
    return now > expireDate
  }
  // No limitation on validity
  return false
}

export const getClaimReturnInfo = (claims: AdvertClaim[], daysValid: number) =>
  claims
    .reduce<AdvertReturnInfo[]>((p, c) => {
      if (c.type === AdvertClaimType.collected && daysValid > 0) {
        const at = new Date(c.at)
        at.setDate(at.getDate() + sanitizeInterval(daysValid))

        return [
          ...p,
          {
            at: at.toISOString(),
            quantity: c.quantity,
          },
        ]
      }
      return [...p]
    }, [])
    .sort((a, b) => a.at.localeCompare(b.at))

export const hasReservations = (claims: AdvertClaim[]) =>
  claims.some(claim => claim.type === AdvertClaimType.reserved)

export const hasCollects = (claims: AdvertClaim[]) =>
  claims.some(claim => claim.type === AdvertClaimType.collected)
