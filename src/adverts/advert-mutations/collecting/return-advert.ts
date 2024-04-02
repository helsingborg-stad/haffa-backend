import { makeUser } from '../../../login'
import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { normalizeAdvertClaims } from '../../advert-claims'
import { getAdvertMeta } from '../../advert-meta'
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
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
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
              notifications.advertWasReturned(
                makeUser({ id: by }),
                quantity,
                patched
              )
            ),
            ...collects.map(({ by, quantity }) =>
              notifications.advertWasReturnedOwner(
                makeUser({ id: by }),
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
