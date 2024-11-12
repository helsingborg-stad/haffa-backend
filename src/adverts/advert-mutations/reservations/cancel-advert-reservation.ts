import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { AdvertClaimType } from '../../types'
import type { AdvertClaim, Advert, AdvertMutations } from '../../types'
import { notifyClaimsWasCancelled } from '../claims/notify-claims'
import { mapTxResultToAdvertMutationResult } from '../mappers'

export const createCancelAdvertReservation =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['cancelAdvertReservation'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(() => undefined)
      .patch((advert, { actions }) => {
        const matchClaim = (c: AdvertClaim) =>
          c.by === user.id && c.type === AdvertClaimType.reserved
        const claims = advert.claims.filter(matchClaim)

        if (claims.length === 0) {
          return null
        }

        actions(patched =>
          notifyClaimsWasCancelled(notifications, user, patched, claims, null)
        )

        /*
        actions((patched, original) =>
          notifications.advertReservationWasCancelled(
            user,
            original.claims
              .filter(
                ({ by, type }) =>
                  by === user.id && type === AdvertClaimType.reserved
              )
              .reduce((s, { quantity }) => s + quantity, 0),
            patched
          )
        )
*/
        return {
          ...advert,
          claims: normalizeAdvertClaims(
            advert.claims // remove all reservations for user
              .filter(claim => !matchClaim(claim))
          ),
        }
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
