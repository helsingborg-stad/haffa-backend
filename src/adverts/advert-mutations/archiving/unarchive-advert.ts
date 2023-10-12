import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'

export const createUnarchiveAdvert =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['unarchiveAdvert'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate((advert, { throwIf }) =>
        throwIf(
          !getAdvertMeta(advert, user).canUnarchive,
          TxErrors.Unauthorized
        )
      )
      .patch(async (advert, { actions }) => {
        actions(patched => notifications.advertWasUnarchived(user, patched))
        return {
          ...advert,
          archivedAt: '',
        }
      })
      .verify(advert => advert)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
