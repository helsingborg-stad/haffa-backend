import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import {
  type AdvertClaim,
  type Advert,
  type AdvertMutations,
  AdvertClaimType,
} from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { createAdvertClaimsNotifier } from '../notifications'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'
import { updateAdvertWithClaimDates } from './mappers'

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
          createAdvertClaimsNotifier({
            notifications,
            user,
            impersonate,
          }).wasCancelled(patched, claims)
        )

        const pickedAt = unpickOnReturn ? '' : advert.pickedAt

        return updateAdvertWithClaimDates(
          {
            ...advert,
            pickedAt,
            claims: normalizeAdvertClaims(
              advert.claims
                .filter(c => !matchClaim(c))
                .filter(({ quantity }) => quantity > 0)
            ),
          },
          type === AdvertClaimType.collected
            ? new Date().toISOString()
            : advert.returnedAt
        )
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
