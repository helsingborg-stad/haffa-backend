import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'

export const createArchiveAdvert =
  ({
    adverts,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'notifications'
  >): AdvertMutations['archiveAdvert'] =>
  (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate((advert, { throwIf }) =>
        throwIf(!getAdvertMeta(advert, user).canArchive, TxErrors.Unauthorized)
      )
      .patch(async (advert, { actions }) => {
        actions(patched =>
          notifications.advertWasArchived(advert.createdBy, user, patched)
        )
        return {
          ...advert,
          archivedAt: new Date().toISOString(),
        }
      })
      .verify(advert => advert)
      .saveVersion((versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(mapTxResultToAdvertMutationResult)
