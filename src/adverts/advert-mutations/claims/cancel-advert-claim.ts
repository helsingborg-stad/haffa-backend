import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
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
    getAdvertMeta,
    adverts,
    notifications,
    workflow: { unpickOnReturn },
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications' | 'workflow'
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
        const pickedAt = unpickOnReturn ? '' : advert.pickedAt

        return {
          ...advert,
          pickedAt,
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
