import { AdvertsRepository } from '../types'

export const createInMemoryAdvertsRepository = (): AdvertsRepository => ({
	list: async () => [{ title: 'en grej' }, { title: 'en sak' }],
})