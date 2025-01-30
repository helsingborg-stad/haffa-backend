import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { getAdvertMeta } from '../../advert-meta'
import type { AdvertClaim, Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'
import { notifyClaimsWasCancelled } from './notify-claims'

export const createCancelAdvertClaim =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['cancelAdvertClaim'] =>
  (user, id, by, type, impersonate) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(
          !getAdvertMeta(advert, user).canManageClaims,
          TxErrors.Unauthorized
        )
      )
      .patch((advert, { actions }) => {
        const matchClaim = (c: AdvertClaim) => c.by === by && c.type === type
        const claims = advert.claims.filter(matchClaim)
        if (claims.length === 0) {
          return null
        }

        actions(patched =>
          notifyClaimsWasCancelled(
            notifications,
            user,
            patched,
            claims,
            impersonate || null
          )
        )

        return {
          ...advert,
          claims: normalizeAdvertClaims(
            advert.claims
              .filter(c => !matchClaim(c))
              .filter(({ quantity }) => quantity > 0)
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
