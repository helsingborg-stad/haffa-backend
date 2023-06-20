import * as uuid from 'uuid'
import { Advert, AdvertsRepository } from '../types'

export const createInMemoryAdvertsRepository = (): AdvertsRepository => {
	const adverts: Advert[] = []
	return ({
		list: async () => adverts,
		create: async (advert) => {
			const a = { ...advert, id: uuid.v4() }
			adverts.push(a)
			console.log({ adverts })
			return a
		},
	})
}
