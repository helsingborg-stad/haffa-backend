import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import { patchAdvertWithAdvertInput } from '../../mappers'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { processAdvertInput } from './process-advert-input'
import {
  verifyAll,
  verifyQuantityAtleatOne,
  verifyReservationsDoesNotExceedQuantity,
} from '../verifiers'

export const createUpdateAdvert =
  ({
    adverts,
    files,
  }: Pick<Services, 'adverts' | 'files'>): AdvertMutations['updateAdvert'] =>
  (user, id, input) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate((advert, { throwIf }) =>
        throwIf(!getAdvertMeta(advert, user).canEdit, TxErrors.Unauthorized)
      )
      .patch(async advert => {
        const patched = patchAdvertWithAdvertInput(advert, input)
        const processed = {
          ...patched,
          ...(await processAdvertInput(patched, files)),
        }
        return processed
      })
      .verify((_, ctx) =>
        verifyAll(
          ctx,
          verifyQuantityAtleatOne,
          verifyReservationsDoesNotExceedQuantity
        )
      )
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
