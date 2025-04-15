import { TxErrors } from '../../../transactions'
import type { Services } from '../../../types'
import { createEmptyAdvert, mapCreateAdvertInputToAdvert } from '../../mappers'
import type { AdvertMutations } from '../../types'
import { mapTxErrorToAdvertMutationStatus } from '../mappers'
import { processAdvertInput } from './process-advert-input'

export const createCreateAdvert =
  ({
    adverts,
    files,
    notifications,
  }: Pick<
    Services,
    'adverts' | 'files' | 'notifications'
  >): AdvertMutations['createAdvert'] =>
  async (user, input) => {
    if (!user.roles?.canEditOwnAdverts) {
      return {
        advert: createEmptyAdvert(),
        status: mapTxErrorToAdvertMutationStatus(TxErrors.Unauthorized),
      }
    }
    const convertedInput = await processAdvertInput(input, files)
    const advert = await adverts.create(user, {
      ...mapCreateAdvertInputToAdvert(convertedInput, user),
    })
    await notifications.advertWasCreated(advert.createdBy, user, advert)
    return { advert, status: null }
  }
