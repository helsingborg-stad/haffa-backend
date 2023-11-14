import { categoryAdapter } from '../../../categories/category-adapter'
import type { SettingsService } from '../../../settings/types'
import type { AdvertsRepository } from '../../types'
import { convertFilterToCategoryMatchingFilter } from './convert-filter-to-category-matching-filter'

export const createAdvertsRepositoryWithCategorySearch = (
  settings: SettingsService,
  inner: AdvertsRepository
): AdvertsRepository => ({
  get stats() {
    return inner.stats
  },
  getAdvert: (...args) => inner.getAdvert(...args),
  saveAdvertVersion: (...args) => inner.saveAdvertVersion(...args),
  list: async (user, filter) => {
    if (filter) {
      return inner.list(
        user,
        await convertFilterToCategoryMatchingFilter(
          filter,
          categoryAdapter(settings)
        )
      )
    }
    return inner.list(user, filter)
  },
  create: (...args) => inner.create(...args),
  remove: (...args) => inner.remove(...args),
  countBy: (...args) => inner.countBy(...args),
  getAggregatedClaims: (...args) => inner.getAggregatedClaims(...args),
})
