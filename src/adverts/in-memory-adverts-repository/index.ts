import type { Advert, AdvertsRepository } from '../types'
import { createFilterPredicate } from '../filters/create-filter-predicate'
import { mapCreateAdvertInputToAdvert, patchAdvertWithAdvertInput } from '../mappers'

export const createInMemoryAdvertsRepository = (db: Record<string, Advert> = {}): AdvertsRepository => ({
		getAdvert: async id => db[id] || null,
		list: async (filter) => Object.values(db).filter(createFilterPredicate(filter)),
		create: async (user, input) => {
			const advert = mapCreateAdvertInputToAdvert(input, user)
			// eslint-disable-next-line no-param-reassign
			db[advert.id] = advert
			return advert
		},
		update: async (id, user, input) => {
			const existing = db[id]
			if (existing) {
				// eslint-disable-next-line no-param-reassign
				db[id] = patchAdvertWithAdvertInput(existing, input)
				return db[id]
			}
			return null
		},
		remove: async (id) => {
			const existing = db[id]
			// eslint-disable-next-line no-param-reassign
			delete db[id]
			return existing
		},
		saveAdvertVersion: async (versionId, advert) => {
			const { id } = advert
			if (db[id]?.versionId === versionId) {
				// eslint-disable-next-line no-param-reassign
				db[id] = advert
				return db[id]
			}
			return null
		},

	})
