import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'
import { notifyClaimsWasRenewed } from './notify-claims'

export const createRenewAdvertClaim =
  ({
    getAdvertMeta,
    adverts,
    notifications,
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications'
  >): AdvertMutations['renewAdvertClaim'] =>
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
            patched.claims.filter(c => c.type === type && c.by === by),
            impersonate || null
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
