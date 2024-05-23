import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import {
  verifyAll,
  verifyReservationLimits,
  verifyReservationsDoesNotExceedQuantity,
  verifyTypeIsReservation,
} from '../verifiers'

export const createMarkAdvertAsPicked =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['markAdvertAsPicked'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(!getAdvertMeta(advert, user).canPick, TxErrors.Unauthorized)
      )
      .patch((advert, { actions }) => {
        const at = new Date().toISOString()
        actions(patched =>
          notifications.advertWasPickedOwner(advert.createdBy, user, patched)
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
