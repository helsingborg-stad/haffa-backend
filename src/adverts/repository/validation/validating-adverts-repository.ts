import type { AdvertsRepository } from '../../types'
import { validateAdvert } from './validate-advert'
import { normalizeAdvert } from '../../mappers'

export const createValidatingAdvertsRepository = (
  inner: AdvertsRepository
): AdvertsRepository => ({
  get stats() {
    return inner.stats
  },
  getAdvert: (...args) =>
    inner.getAdvert(...args).then(a => (a ? normalizeAdvert(a) : null)),
  saveAdvertVersion: async (user, versionId, advert) =>
    inner
      .saveAdvertVersion(user, versionId, await validateAdvert(advert))
      .then(a => (a ? normalizeAdvert(a) : null)),
  list: (...args) =>
    inner
      .list(...args)
      .then(l => ({ ...l, adverts: l.adverts.map(normalizeAdvert) })),
  create: async (user, advert) =>
    inner.create(user, await validateAdvert(advert)).then(normalizeAdvert),
  remove: (...args) => inner.remove(...args),
  countBy: (...args) => inner.countBy(...args),
  getAdvertsByClaimStatus: (...args) => inner.getAdvertsByClaimStatus(...args),
  getSnapshot: (...args) => inner.getSnapshot(...args),
  getReservableAdvertsWithWaitlist: (...args) =>
    inner.getReservableAdvertsWithWaitlist(...args),
})
