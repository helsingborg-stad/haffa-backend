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

export const createConvertAdvertClaim =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['convertAdvertClaim'] =>
  (user, id, by, type, newType) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(
          !getAdvertMeta(advert, user).canManageClaims,
          TxErrors.Unauthorized
        )
      )
      .patch((advert, { actions }) => {
        const matchClaim = (c: AdvertClaim) =>
          c.by === by && c.type === type && c.type !== newType
        const claims = advert.claims.filter(matchClaim)
        if (claims.length === 0) {
          return null
        }

        claims.forEach(claim =>
          actions(patched =>
            newType === AdvertClaimType.collected
              ? notifications.advertWasCollected(
                  { id: by },
                  claim.quantity,
                  patched
                )
              : Promise.resolve()
          )
        )
        return {
          ...advert,
          claims: advert.claims
            .filter(c => !matchClaim(c))
            .concat(
              claims.map(c => ({
                ...c,
                at: new Date().toISOString(),
                type: newType,
              }))
            )
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
