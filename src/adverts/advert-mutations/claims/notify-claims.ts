import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import { normalizeAdvertClaims } from '../../advert-claims'
import type { Advert, AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'

const all = (promises: Promise<any>[]) =>
  Promise.all(promises).then(() => undefined)

export const notifyClaimsWas = async (
  notifications: NotificationService,
  by: HaffaUser,
  advert: Advert,
  claims: AdvertClaim[]
) => {
  const nc = normalizeAdvertClaims(claims)
  await all(
    nc
      .filter(claim => claim.type === AdvertClaimType.reserved)
      .map(claim =>
        Promise.all([
          notifications.advertWasReserved(claim.by, by, claim.quantity, advert),
          notifications.advertWasReservedOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert
          ),
        ])
      )
  )

  await all(
    nc
      .filter(claim => claim.type === AdvertClaimType.collected)
      .map(claim =>
        Promise.all([
          notifications.advertWasCollected(
            claim.by,
            by,
            claim.quantity,
            advert
          ),
          notifications.advertWasCollectedOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert
          ),
        ])
      )
  )
}

export const notifyClaimsWasCancelled = async (
  notifications: NotificationService,
  by: HaffaUser,
  advert: Advert,
  claims: AdvertClaim[]
) => {
  const nc = normalizeAdvertClaims(claims)
  await all(
    nc
      .filter(claim => claim.type === AdvertClaimType.reserved)
      .map(claim =>
        Promise.all([
          notifications.advertReservationWasCancelled(
            claim.by,
            by,
            claim.quantity,
            advert
          ),
          notifications.advertReservationWasCancelledOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert
          ),
        ])
      )
  )

  await all(
    nc
      .filter(claim => claim.type === AdvertClaimType.collected)
      .map(claim =>
        Promise.all([
          notifications.advertCollectWasCancelled(
            claim.by,
            by,
            claim.quantity,
            advert
          ),
          notifications.advertCollectWasCancelledOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert
          ),
        ])
      )
  )
}
