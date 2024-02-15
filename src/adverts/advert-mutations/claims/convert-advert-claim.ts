import { makeUser } from '../../../login'
import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import type { AdvertClaim, Advert, AdvertMutations } from '../../types'
import {
  mapTxResultToAdvertMutationResult,
  normalizeAdvertClaims,
} from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'
import { notifyClaimsWas } from './notify-claims'

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

        const updatedClaims = claims.map(c => ({
          ...c,
          at: new Date().toISOString(),
          type: newType,
          events: [],
        }))

        actions(patched =>
          notifyClaimsWas(
            notifications,
            makeUser({ id: by }),
            patched,
            updatedClaims
          )
        )
        return {
          ...advert,
          claims: normalizeAdvertClaims(
            advert.claims.filter(c => !matchClaim(c)).concat(updatedClaims)
          ),
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
