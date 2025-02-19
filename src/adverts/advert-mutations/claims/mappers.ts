import { sortBy } from '../../../lib'
import { dateBuilder } from '../../../lib/date-builder'
import type { Func } from '../../../lib/types'
import type { HaffaUser } from '../../../login/types'
import { AdvertClaimType } from '../../types'
import type { AdvertReturnInfo, AdvertClaim } from '../../types'

/**
 * Returns the date when the last event was generated
 * e.g when the last reminder was sent
 * @param claim A refereence to an AdvertClaim
 * @returns A date object
 */
export const getLastClaimEventDate = (claim: AdvertClaim): Date =>
  // If no events are logged, return the date
  // of the claim itself as it represents the
  // time of the latest status change
  new Date(
    claim.events && claim.events.length > 0
      ? [...claim.events].sort(sortBy(ev => ev.at)).reverse()[0].at
      : claim.at
  )

/**
 * Given an interval, calculate when, at the earliest
 * the next event is allowed to be logged
 * @param claim A reference to an AdvertClaim
 * @param interval The number of days that should occur before a new event is logged
 * @returns A Date object
 */
export const getNextClaimEventDate = (claim: AdvertClaim, interval: number) =>
  dateBuilder(getLastClaimEventDate(claim))
    .addDays(Math.max(interval, 0))
    .toDate()

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
    return now > dateBuilder(claim.at).addDays(daysValid).toDate()
  }
  // No limitation on validity
  return false
}

export const getClaimReturnInfo = (
  { id }: HaffaUser,
  claims: AdvertClaim[],
  daysValid: number
): AdvertReturnInfo[] =>
  daysValid > 0
    ? claims
        .filter(({ type }) => type === AdvertClaimType.collected)
        .map(({ at, by, quantity }) => ({
          at: dateBuilder(at).addDays(daysValid).toISOString(),
          quantity,
          isMine: by === id,
        }))
        .sort(sortBy(c => c.at))
    : []

export const hasReservations = (claims: AdvertClaim[]) =>
  claims.some(claim => claim.type === AdvertClaimType.reserved)

export const hasCollects = (claims: AdvertClaim[]) =>
  claims.some(claim => claim.type === AdvertClaimType.collected)

export const claimsBy =
  (user: HaffaUser, type: AdvertClaimType): Func<AdvertClaim, boolean> =>
  c =>
    c.by === user.id && c.type === type
