import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { getAdvertMeta } from '../../advert-meta'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'
import {
  notifyClaimsWasCancelled,
  notifyClaimsWasRenewed,
} from './notify-claims'

export const createRenewAdvertClaim =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['renewAdvertClaim'] =>
  (user, id, by, type) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(
          !getAdvertMeta(advert, user).canManageClaims,
          TxErrors.Unauthorized
        )
      )
      .patch((advert, { actions }) => {
        const claims = normalizeAdvertClaims(
          advert.claims.map(claim =>
            claim.by === by && claim.type === type
              ? {
                  ...claim,
                  at: new Date().toISOString(),
                  events: [],
                }
              : claim
          )
        )

        actions(patched =>
          notifyClaimsWasRenewed(
            notifications,
            user,
            patched,
            patched.claims.filter(c => c.type === type && c.by === by)
          )
        )

        return {
          ...advert,
          claims,
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
