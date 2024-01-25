import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import type { Advert, AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'
import { normalizeAdvertClaims } from '../mappers'

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
          notifications.advertWasReserved(by, claim.quantity, advert),
          notifications.advertWasReservedOwner(by, claim.quantity, advert),
        ])
      )
  )

  await all(
    nc
      .filter(claim => claim.type === AdvertClaimType.collected)
      .map(claim =>
        Promise.all([
          notifications.advertWasCollected(by, claim.quantity, advert),
          notifications.advertWasCollectedOwner(by, claim.quantity, advert),
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
            by,
            claim.quantity,
            advert
          ),
          notifications.advertReservationWasCancelledOwner(
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
          notifications.advertCollectWasCancelled(by, claim.quantity, advert),
          notifications.advertCollectWasCancelledOwner(
            by,
            claim.quantity,
            advert
          ),
        ])
      )
  )
}
