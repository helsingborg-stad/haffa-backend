import type { AdvertsRepository } from '../adverts/types'

export const statsAdapter = (adverts: AdvertsRepository) => ({
  getStats: () => adverts.stats,
})
