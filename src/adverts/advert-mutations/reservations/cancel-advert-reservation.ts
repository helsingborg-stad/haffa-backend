import { txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { AdvertClaimType } from '../../types'
import type { AdvertClaim, Advert, AdvertMutations } from '../../types'
import { createAdvertClaimsNotifier } from '../notifications/advert-claims-notifier'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { updateAdvertWithClaimDates } from '../claims/mappers'

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
          createAdvertClaimsNotifier({ user, notifications }).wasCancelled(
            patched,
            claims
          )
        )

        return updateAdvertWithClaimDates({
          ...advert,
          claims: normalizeAdvertClaims(
            advert.claims // remove all reservations for user
              .filter(claim => !matchClaim(claim))
          ),
        })
      })
      .verify(update => update)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
