import type { Advert, AdvertClaim, AdvertsRepository } from '../../types'
import { createAdvertFilterPredicate } from '../../filters/advert-filter-predicate'
import { createAdvertFilterComparer } from '../../filters/advert-filter-sorter'
import type { StartupLog } from '../../../types'
import { createPagedAdvertList } from '../../mappers'

export const createInMemoryAdvertsRepositoryFromEnv = (
  startupLog: StartupLog
) =>
  startupLog.echo(createInMemoryAdvertsRepository(), {
    name: 'adverts',
    config: {
      on: 'memory',
    },
  })

export const createInMemoryAdvertsRepository = (
  db: Record<string, Advert> = {}
): AdvertsRepository => ({
  stats: {
    get advertCount() {
      return Object.keys(db).length
    },
  },
  getAdvert: async (user, id) => db[id] || null,
  list: async (user, filter) => {
    const allAdverts = Object.values(db)
      .filter(createAdvertFilterPredicate(user, filter))
      .sort(createAdvertFilterComparer(user, filter))

    return createPagedAdvertList(allAdverts, filter)
  },
  create: async (user, advert) => {
    // eslint-disable-next-line no-param-reassign
    db[advert.id] = advert
    return advert
  },
  remove: async (user, id) => {
    const existing = db[id]
    // eslint-disable-next-line no-param-reassign
    delete db[id]
    return existing
  },
  saveAdvertVersion: async (user, versionId, advert) => {
    const { id } = advert
    if (db[id]?.versionId === versionId) {
      // eslint-disable-next-line no-param-reassign
      db[id] = advert
      return db[id]
    }
    return null
  },
  countBy: async (user, by) =>
    Object.values(db).reduce<Record<string, number>>((s, advert) => {
      const v = (advert[by] || '').toString()
      // eslint-disable-next-line no-param-reassign
      s[v] = (s[v] || 0) + 1
      return s
    }, {}),
  getAggregatedClaims: async filter => {
    const dateCompare = (claim: AdvertClaim): boolean =>
      new Date(claim.at) <= filter.before && claim.type === filter.type

    return Object.values(db)
      .filter(advert => advert.claims.some(dateCompare))
      .map(advert => ({
        id: advert.id,
        advert: {
          claims: advert.claims.filter(dateCompare),
        },
      }))
  },
})
