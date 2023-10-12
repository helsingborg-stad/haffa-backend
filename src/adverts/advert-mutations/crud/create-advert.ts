import type { Services } from '../../../types'
import { mapCreateAdvertInputToAdvert } from '../../mappers'
import type { AdvertMutations } from '../../types'
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
  (user, input) =>
    processAdvertInput(input, files)
      .then(convertedInput =>
        adverts.create(user, mapCreateAdvertInputToAdvert(convertedInput, user))
      )
      .then(async advert => {
        await notifications.advertWasCreated(user, advert)
        return advert
      })
      .then(advert => ({ advert, status: null }))
