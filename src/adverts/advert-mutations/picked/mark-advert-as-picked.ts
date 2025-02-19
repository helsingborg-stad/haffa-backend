import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { AdvertClaimType, type Advert, type AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { createAdvertNotifier } from '../notifications'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'

export const createMarkAdvertAsPicked =
  ({
    getAdvertMeta,
    adverts,
    notifications,
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications'
  >): AdvertMutations['markAdvertAsPicked'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(!getAdvertMeta(advert, user).canPick, TxErrors.Unauthorized)
      )
      .patch((advert, { actions }) => {
        const at = new Date().toISOString()
        const reservers = advert.claims.filter(
          ({ type }) => type === AdvertClaimType.reserved
        )

        actions(patched =>
          createAdvertNotifier({ notifications, user }).wasPicked(
            patched,
            reservers
          )
        )

        return {
          ...advert,
          pickedAt: at,
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
