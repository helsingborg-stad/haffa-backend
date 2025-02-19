import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { AdvertClaimType, type Advert, type AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { createAdvertClaimsNotifier } from '../notifications'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'

export const createReturnAdvert =
  ({
    getAdvertMeta,
    adverts,
    notifications,
    workflow: { unpickOnReturn },
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications' | 'workflow'
  >): AdvertMutations['returnAdvert'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(!getAdvertMeta(advert, user).canReturn, TxErrors.Unauthorized)
      )
      .patch((advert, { actions }) => {
        const collects = advert.claims.filter(
          ({ type }) => type === AdvertClaimType.collected
        )

        actions(patched =>
          createAdvertClaimsNotifier({ notifications, user }).wasReturned(
            patched,
            collects
          )
        )

        const pickedAt = unpickOnReturn ? '' : advert.pickedAt

        return {
          ...advert,
          pickedAt,
          claims: normalizeAdvertClaims(
            advert.claims.filter(
              ({ type }) => type !== AdvertClaimType.collected
            )
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
