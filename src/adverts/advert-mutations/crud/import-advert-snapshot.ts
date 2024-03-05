import type { Services } from '../../../types'
import { validateAdvert } from '../../repository/validation'
import type { AdvertMutations } from '../../types'
import { processAdvertInput } from './process-advert-input'

export const createImportAdvertSnapshot =
  ({
    adverts,
    files,
  }: Pick<
    Services,
    'adverts' | 'files'
  >): AdvertMutations['importAdvertSnapshot'] =>
  async (user, advertSnapshot) => {
    const advert = validateAdvert(advertSnapshot)
    if (advert) {
      const existing = await adverts.getAdvert(user, advert.id)
      if (!existing) {
        const processed = {
          ...advert,
          ...(await processAdvertInput(advert, files)),
        }
        await adverts.create(user, processed)
        return true
      }
    }
    return false
  }
