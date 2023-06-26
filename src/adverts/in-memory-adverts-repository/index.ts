import * as uuid from 'uuid'
import { Advert, AdvertsRepository } from '../types'

export const createInMemoryAdvertsRepository = (): AdvertsRepository => {
	const adverts: Advert[] = []
	return ({
		getAdvert: async id => adverts.find(advert => advert.id === id) || null,
		list: async () => adverts,
		create: async (advert) => {
			adverts.push(advert)
			console.log({ adverts })
			return advert
		},
	})
}
