import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'
import { createAdvertNotifier } from '../notifications'

export const createUnarchiveAdvert =
  ({
    getAdvertMeta,
    adverts,
    notifications,
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications'
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
        actions(patched =>
          createAdvertNotifier({ notifications, user }).wasUnArchived(patched)
        )
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
