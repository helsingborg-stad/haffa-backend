export interface CreateAdvertInput {
	title: string
	description: string
}
export interface Advert {
	id: string
	title: string
	description: string
}
export interface AdvertsRepository {
	list: () => Promise<Advert[]>
	create: (advert: CreateAdvertInput) => Promise<Advert>
}