import { Advert, AdvertsRepository } from '../types'
import { createFilterPredicate } from '../filters/create-filter-predicate'
import { mapCreateAdvertInputToAdvert, patchAdvertWithAdvertInput } from '../mappers'

export const createInMemoryAdvertsRepository = (db: Record<string, Advert> = {}): AdvertsRepository => {
	return ({
		getAdvert: async id => db[id] || null,
		list: async (filter) => Object.values(db).filter(createFilterPredicate(filter)),
		create: async (user, input) => {
			const advert = mapCreateAdvertInputToAdvert(input, user)
			db[advert.id] = advert
			return advert
		},
		update: async (id, user, input) => {
			const existing = db[id]
			if (existing) {
				db[id] = patchAdvertWithAdvertInput(existing, input)
				return db[id]
			}
			return null
		},
		saveAdvertVersion: async (versionId, advert) => {
			const { id } = advert
			if (db[id]?.versionId === versionId) {
				db[id] = advert
				return db[id]
			}
			return null
		},

	})
}
