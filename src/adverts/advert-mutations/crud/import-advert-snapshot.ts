import type { Services } from '../../../types'
import type { Advert, AdvertMutations } from '../../types'
import { processAdvertInput } from './process-advert-input'

const advertStringProps: (keyof Advert)[] = [
  'id',
  'title',
  'description',
  'category',
]

const validateAdvert = (advertSnapshot: any): Advert | null => {
  const isValid =
    advertStringProps.every(prop => typeof advertSnapshot[prop] === 'string') &&
    advertSnapshot?.id?.length > 0

  return isValid ? (advertSnapshot as Advert) : null
}

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
