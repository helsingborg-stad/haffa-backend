import * as uuid from 'uuid'
import { Advert, AdvertsRepository } from '../types'
import { createFilterPredicate } from '../filters/create-filter-predicate'
import { mapCreateAdvertInputToAdvert, patchAdvertWithAdvertInput } from '../mappers'

export const createInMemoryAdvertsRepository = (): AdvertsRepository => {
	const adverts: Advert[] = []
	return ({
		getAdvert: async id => adverts.find(advert => advert.id === id) || null,
		list: async (filter) => adverts.filter(createFilterPredicate(filter)),
		create: async (user, input) => {
			const advert = mapCreateAdvertInputToAdvert(input, user)
			adverts.push(advert)
			return advert
		},
		update: async (id, user, input) => {
			const index = adverts.findIndex(existing => existing.id === id)
			if (index >= 0) {
				const updated = patchAdvertWithAdvertInput(adverts[index], input)
				adverts[index] = updated
				return updated
			}
			return null
		},

	})
}
