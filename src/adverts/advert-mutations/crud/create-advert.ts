import type { Services } from '../../../types'
import { mapCreateAdvertInputToAdvert } from '../../mappers'
import type { AdvertMutations } from '../../types'
import { processAdvertInput } from './process-advert-input'

export const createCreateAdvert =
  ({
    adverts,
    files,
  }: Pick<Services, 'adverts' | 'files'>): AdvertMutations['createAdvert'] =>
  (user, input) =>
    processAdvertInput(input, files)
      .then(convertedInput =>
        adverts.create(user, mapCreateAdvertInputToAdvert(convertedInput, user))
      )
      .then(advert => ({ advert, status: null }))
