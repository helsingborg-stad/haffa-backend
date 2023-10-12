import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import { getAdvertMeta } from '../../advert-meta'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'

export const createRemoveAdvert =
  ({
    adverts,
    files,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'files' | 'notifications'
  >): AdvertMutations['removeAdvert'] =>
  async (user, id) =>
    txBuilder<Advert>()
      .load(() => adverts.getAdvert(user, id))
      .validate(async (advert, { throwIf }) =>
        throwIf(!getAdvertMeta(advert, user).canRemove, TxErrors.Unauthorized)
      )
      .patch(async (advert, { actions }) => {
        actions(() => notifications.advertWasRemoved(user, advert))
        advert.images.forEach(({ url }) =>
          actions(() => files.tryCleanupUrl(url))
        )
        return advert
      })
      .verify(async update => update)
      .saveVersion(async () => adverts.remove(user, id))
      .run()
      .then(mapTxResultToAdvertMutationResult)
