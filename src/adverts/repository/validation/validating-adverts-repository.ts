import type { AdvertsRepository } from '../../types'
import { validateAdvert } from './validate-advert'

export const createValidatingAdvertsRepository = (
  inner: AdvertsRepository
): AdvertsRepository => ({
  get stats() {
    return inner.stats
  },
  getAdvert: (...args) => inner.getAdvert(...args),
  saveAdvertVersion: async (user, versionId, advert) =>
    inner.saveAdvertVersion(user, versionId, await validateAdvert(advert)),
  list: (...args) => inner.list(...args),
  create: async (user, advert) =>
    inner.create(user, await validateAdvert(advert)),
  remove: (...args) => inner.remove(...args),
  countBy: (...args) => inner.countBy(...args),
  getAdvertsByClaimStatus: (...args) => inner.getAdvertsByClaimStatus(...args),
  getSnapshot: (...args) => inner.getSnapshot(...args),
})
