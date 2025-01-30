import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { getAdvertMeta } from '../../advert-meta'
import {
  type AdvertClaim,
  type Advert,
  type AdvertMutations,
  AdvertClaimType,
} from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
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
    workflow: { pickOnCollect },
  }: Pick<
    Services,
    'adverts' | 'notifications' | 'workflow'
  >): AdvertMutations['convertAdvertClaim'] =>
  (user, id, by, type, newType, impersonate) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(
          !getAdvertMeta(advert, user).canManageClaims,
          TxErrors.Unauthorized
        )
      )
      .patch((advert, { actions }) => {
        const at = new Date().toISOString()

        const matchClaim = (c: AdvertClaim) =>
          c.by === by && c.type === type && c.type !== newType

        const claims = advert.claims.filter(matchClaim)
        if (claims.length === 0) {
          return null
        }

        const updatedClaims = claims.map(c => ({
          ...c,
          at,
          type: newType,
          events: [],
        }))

        actions(patched =>
          notifyClaimsWas(
            notifications,
            user,
            patched,
            updatedClaims,
            impersonate || null
          )
        )
        const pickedAt =
          newType === AdvertClaimType.collected && pickOnCollect
            ? at
            : advert.pickedAt

        return {
          ...advert,
          pickedAt,
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
