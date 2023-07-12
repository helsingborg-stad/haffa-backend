import type { Advert, AdvertsRepository } from '../types'
import { createAdvertFilterPredicate } from '../filters/advert-filter-predicate'
import { createAdvertFilterComparer } from '../filters/advert-filter-sorter'

export const createInMemoryAdvertsRepository = (db: Record<string, Advert> = {}): AdvertsRepository => ({
		getAdvert: async (user, id) => db[id] || null,
		list: async (user, filter) => Object.values(db).filter(createAdvertFilterPredicate(user, filter)).sort(createAdvertFilterComparer(user, filter)),
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

	})
