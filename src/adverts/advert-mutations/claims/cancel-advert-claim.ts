import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import { AdvertClaimType } from '../../types'
import type { AdvertClaim, Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'

export const createCancelAdvertClaim =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['cancelAdvertClaim'] =>
  (user, id, by, type) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(
          !getAdvertMeta(advert, user).canCancelClaim,
          TxErrors.Unauthorized
        )
      )
      .patch((advert, { actions }) => {
        const matchClaim = (c: AdvertClaim) => c.by === by && c.type === type
        const claims = advert.claims.filter(matchClaim)
        if (claims.length === 0) {
          return null
        }

        claims
          .filter(claim => claim.type === AdvertClaimType.reserved)
          .forEach(claim =>
            actions(patched =>
              notifications.advertReservationWasCancelled(
                { id: by },
                claim.quantity,
                patched
              )
            )
          )
        return {
          ...advert,
          claims: advert.claims
            .filter(c => !matchClaim(c))
            .filter(({ quantity }) => quantity > 0),
        }
      })
      .verify((_, ctx) =>
        verifyAll(
          ctx,
          verifyTypeIsReservation,
          verifyReservationLimits,
          verifyReservationsDoesNotExceedQuantity
        )
      )
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
