import { Readable } from 'stream'
import type { Advert, AdvertClaim, AdvertsRepository } from '../../types'
import { createAdvertFilterPredicate } from '../../filters/advert-filter-predicate'
import { createAdvertFilterComparer } from '../../filters/advert-filter-sorter'
import type { StartupLog } from '../../../types'
import { createPagedAdvertList } from '../../mappers'
import { createValidatingAdvertsRepository } from '../validation'

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
): AdvertsRepository & { getDb: () => Record<string, Advert> } => ({
  getDb: () => db,
  ...createValidatingAdvertsRepository({
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
    getAdvertsByClaimStatus: async filter => {
      const compare = (claim: AdvertClaim): boolean =>
        claim.type === filter.type

      return Object.values(db)
        .filter(advert => advert.claims.some(compare))
        .map(advert => advert.id)
    },
    getSnapshot: () => {
      const values = Object.values(db)
      let cursor = 0
      return new Readable({
        objectMode: true,
        read() {
          if (cursor < values.length) {
            this.push(values[cursor])
            cursor += 1
          } else {
            this.push(null)
          }
        },
      })
    },
    getReservableAdvertsWithWaitlist: async () =>
      Object.values(db)
        .filter(({ waitlist }) => waitlist.length > 0)
        .filter(
          ({ quantity, claims }) =>
            quantity > claims.map(c => c.quantity).reduce((s, q) => s + q, 0)
        )
        .map(({ id }) => id),
  }),
})
