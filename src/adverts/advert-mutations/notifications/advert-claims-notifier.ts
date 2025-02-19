import type { Func } from '../../../lib/types'
import type { HaffaUser } from '../../../login/types'
import type { NotificationService } from '../../../notifications/types'
import { patchAdvertWithPickupLocation } from '../../../pickup/mappers'
import type { ProfileInput } from '../../../profile/types'
import { normalizeAdvertClaims } from '../../advert-claims'
import type { AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'
import type { AdvertClaimsNotifier } from './types'

export const createAdvertClaimsNotifier: Func<
  {
    user: HaffaUser
    notifications: NotificationService
    impersonate?: Partial<ProfileInput> | null
  },
  AdvertClaimsNotifier
> = ({ user, notifications, impersonate = null }) => {
  interface NotifyRule {
    type: AdvertClaimType
    notify: Func<AdvertClaim, Promise<void>>
  }

  const makeRule = (
    type: AdvertClaimType,
    ...notifiers: Func<AdvertClaim, Promise<void>>[]
  ): NotifyRule[] => notifiers.map(notify => ({ type, notify }))

  const notify = async (claims: AdvertClaim[], ...rules: NotifyRule[]) =>
    Promise.all(
      normalizeAdvertClaims(claims)
        .map(claim => ({
          claim,
          notifyList: rules
            .filter(rule => rule.type === claim.type)
            .map(rule => rule.notify),
        }))
        .map(({ claim, notifyList }) =>
          notifyList.map(notifyClaim => ({ claim, notifyClaim }))
        )
        .reduce((memo, l) => [...memo, ...l], [])
        .map(({ claim, notifyClaim }) => notifyClaim(claim))
    )

  return {
    wasReserved: (advert, quantity, claims) =>
      notify(
        claims,
        ...makeRule(
          AdvertClaimType.reserved,
          claim =>
            notifications.advertWasReserved(
              claim.by,
              user,
              quantity,
              patchAdvertWithPickupLocation(advert, claim.pickupLocation),
              null
            ),
          claim =>
            notifications.advertWasReservedOwner(
              advert.createdBy,
              user,
              quantity,
              patchAdvertWithPickupLocation(advert, claim.pickupLocation),
              null
            ),
          claim =>
            claim.pickupLocation?.notifyEmail
              ? notifications.advertWasReservedOwner(
                  claim.pickupLocation?.notifyEmail,
                  user,
                  quantity,
                  patchAdvertWithPickupLocation(advert, claim.pickupLocation),
                  null
                )
              : Promise.resolve()
        )
      ),
    wasCollected: (advert, quantity, claims) =>
      notify(
        claims,
        ...makeRule(
          AdvertClaimType.collected,
          claim =>
            notifications.advertWasCollected(
              claim.by,
              user,
              quantity,
              patchAdvertWithPickupLocation(advert, claim.pickupLocation),
              null
            ),
          claim =>
            notifications.advertWasCollectedOwner(
              advert.createdBy,
              user,
              quantity,
              patchAdvertWithPickupLocation(advert, claim.pickupLocation),
              null
            ),
          claim =>
            claim.pickupLocation?.notifyEmail
              ? notifications.advertWasCollectedOwner(
                  claim.pickupLocation.notifyEmail,
                  user,
                  quantity,
                  patchAdvertWithPickupLocation(advert, claim.pickupLocation),
                  null
                )
              : Promise.resolve()
        )
      ),
    wasCancelled: (advert, claims) =>
      notify(
        claims,
        ...makeRule(
          AdvertClaimType.reserved,
          claim =>
            notifications.advertReservationWasCancelled(
              claim.by,
              user,
              claim.quantity,
              advert,
              impersonate
            ),
          claim =>
            notifications.advertReservationWasCancelledOwner(
              advert.createdBy,
              user,
              claim.quantity,
              advert,
              impersonate
            )
        ),
        ...makeRule(
          AdvertClaimType.collected,
          claim =>
            notifications.advertCollectWasCancelled(
              claim.by,
              user,
              claim.quantity,
              advert,
              impersonate
            ),
          claim =>
            notifications.advertCollectWasCancelledOwner(
              advert.createdBy,
              user,
              claim.quantity,
              advert,
              impersonate
            )
        )
      ),
    wasReservedOrCollected: (advert, claims) =>
      notify(
        claims,
        ...makeRule(
          AdvertClaimType.reserved,
          claim =>
            notifications.advertWasReserved(
              claim.by,
              user,
              claim.quantity,
              advert,
              impersonate
            ),
          claim =>
            notifications.advertWasReservedOwner(
              advert.createdBy,
              user,
              claim.quantity,
              advert,
              impersonate
            )
        ),
        ...makeRule(
          AdvertClaimType.collected,
          claim =>
            notifications.advertWasCollected(
              claim.by,
              user,
              claim.quantity,
              advert,
              impersonate
            ),
          claim =>
            notifications.advertWasCollectedOwner(
              advert.createdBy,
              user,
              claim.quantity,
              advert,
              impersonate
            )
        )
      ),
    wasRenewed: (advert, claims) =>
      notify(
        claims,
        ...makeRule(
          AdvertClaimType.reserved,
          claim =>
            notifications.advertReservationWasRenewed(
              claim.by,
              user,
              claim.quantity,
              advert,
              impersonate
            ),
          claim =>
            notifications.advertReservationWasRenewedOwner(
              advert.createdBy,
              user,
              claim.quantity,
              advert,
              impersonate
            )
        ),
        ...makeRule(
          AdvertClaimType.collected,
          claim =>
            notifications.advertCollectWasRenewed(
              claim.by,
              user,
              claim.quantity,
              advert,
              impersonate
            ),
          claim =>
            notifications.advertCollectWasRenewedOwner(
              advert.createdBy,
              user,
              claim.quantity,
              advert,
              impersonate
            )
        )
      ),
    wasReturned: (advert, claims) =>
      notify(
        claims,
        ...makeRule(
          AdvertClaimType.collected,
          claim =>
            notifications.advertWasReturned(
              claim.by,
              user,
              claim.quantity,
              patchAdvertWithPickupLocation(advert, claim.pickupLocation)
            ),
          claim =>
            notifications.advertWasReturnedOwner(
              advert.createdBy,
              user,
              claim.quantity,
              patchAdvertWithPickupLocation(advert, claim.pickupLocation)
            ),
          claim =>
            claim.pickupLocation?.notifyEmail
              ? notifications.advertWasReturnedOwner(
                  claim.pickupLocation.notifyEmail,
                  user,
                  claim.quantity,
                  patchAdvertWithPickupLocation(advert, claim.pickupLocation)
                )
              : Promise.resolve()
        )
      ),
  }
}
