import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { AdvertClaimType, type Advert, type AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
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
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications'
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
          Promise.all([
            ...collects.map(({ by, quantity }) =>
              notifications.advertWasReturned(by, user, quantity, patched)
            ),
            ...collects.map(({ by, quantity }) =>
              notifications.advertWasReturnedOwner(
                advert.createdBy,
                user,
                quantity,
                patched
              )
            ),
          ])
        )
        return {
          ...advert,
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
