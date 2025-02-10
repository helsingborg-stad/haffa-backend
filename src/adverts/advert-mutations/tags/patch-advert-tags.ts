import { exceptValues, uniqueBy } from '../../../lib'
import { TxErrors, txBuilder } from '../../../transactions'
import type { Services } from '../../../types'
import type { Advert, AdvertMutations } from '../../types'
import { mapTxResultToAdvertMutationResult } from '../mappers'

export const createPatchAdvertTags =
  ({
    getAdvertMeta,
    adverts,
  }: Pick<
    Services,
    'getAdvertMeta' | 'adverts' | 'notifications'
  >): AdvertMutations['patchAdvertTags'] =>
  (user, id, { add, remove }) =>
    txBuilder<Advert>()
      .load(async () => adverts.getAdvert(user, id))
      .validate((advert, { throwIf }) => {
        throwIf(!getAdvertMeta(advert, user).canEdit, TxErrors.Unauthorized)
      })
      .patch(async advert => ({
        ...advert,
        tags: [...advert.tags, ...add]
          .filter(exceptValues(remove, v => v))
          .filter(uniqueBy(v => v)),
      }))
      .verify(advert => advert)
      .saveVersion(async (versionId, advert) =>
        adverts.saveAdvertVersion(user, versionId, advert)
      )
      .run()
      .then(result => mapTxResultToAdvertMutationResult(result))
