import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { type Advert, type AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { createAdvertNotifier } from '../notifications'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'

export const createMarkAdvertAsUnpicked =
  ({
    getAdvertMeta,
    adverts,
    notifications,
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications'
  >): AdvertMutations['markAdvertAsUnpicked'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(!getAdvertMeta(advert, user).canUnpick, TxErrors.Unauthorized)
      )
      .patch((advert, { actions }) => {
        actions(patched =>
          createAdvertNotifier({ notifications, user }).wasUnPicked(patched)
        )
        return {
          ...advert,
          pickedAt: '',
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
