import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import type { ProfileInput } from '../../../profile/types'
import { normalizeAdvertClaims } from '../../advert-claims'
import type { Advert, AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'

const all = (promises: Promise<any>[]) =>
  Promise.all(promises).then(() => undefined)

export const notifyClaimsWas = async (
  notifications: NotificationService,
  by: HaffaUser,
  advert: Advert,
  claims: AdvertClaim[],
  impersonate: Partial<ProfileInput> | null
) => {
  const nc = normalizeAdvertClaims(claims)
  await all(
    nc
      .filter(claim => claim.type === AdvertClaimType.reserved)
      .map(claim =>
        Promise.all([
          notifications.advertWasReserved(
            claim.by,
            by,
            claim.quantity,
            advert,
            impersonate
          ),
          notifications.advertWasReservedOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert,
            impersonate
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
            advert,
            impersonate
          ),
          notifications.advertWasCollectedOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert,
            impersonate
          ),
        ])
      )
  )
}

export const notifyClaimsWasCancelled = async (
  notifications: NotificationService,
  by: HaffaUser,
  advert: Advert,
  claims: AdvertClaim[],
  impersonate: Partial<ProfileInput> | null
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
            advert,
            impersonate
          ),
          notifications.advertReservationWasCancelledOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert,
            impersonate
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
            advert,
            impersonate
          ),
          notifications.advertCollectWasCancelledOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert,
            impersonate
          ),
        ])
      )
  )
}

export const notifyClaimsWasRenewed = async (
  notifications: NotificationService,
  by: HaffaUser,
  advert: Advert,
  claims: AdvertClaim[],
  impersonate: Partial<ProfileInput> | null
) => {
  const nc = normalizeAdvertClaims(claims)
  await all(
    nc
      .filter(claim => claim.type === AdvertClaimType.reserved)
      .map(claim =>
        Promise.all([
          notifications.advertReservationWasRenewed(
            claim.by,
            by,
            claim.quantity,
            advert,
            impersonate
          ),
          notifications.advertReservationWasRenewedOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert,
            impersonate
          ),
        ])
      )
  )

  await all(
    nc
      .filter(claim => claim.type === AdvertClaimType.collected)
      .map(claim =>
        Promise.all([
          notifications.advertCollectWasRenewed(
            claim.by,
            by,
            claim.quantity,
            advert,
            impersonate
          ),
          notifications.advertCollectWasRenewedOwner(
            advert.createdBy,
            by,
            claim.quantity,
            advert,
            impersonate
          ),
        ])
      )
  )
}
