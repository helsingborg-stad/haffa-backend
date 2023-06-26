import { Advert, AdvertsRepository } from '../types'
import { createFilterPredicate } from '../filters/create-filter-predicate'

export const createInMemoryAdvertsRepository = (): AdvertsRepository => {
	const adverts: Advert[] = []
	return ({
		getAdvert: async id => adverts.find(advert => advert.id === id) || null,
		list: async (filter) => adverts.filter(createFilterPredicate(filter)),
		create: async (advert) => {
			adverts.push(advert)
			return advert
		},
	})
}
