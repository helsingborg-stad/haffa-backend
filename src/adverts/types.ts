export interface AdvertsUser {
	id: string
	roles: string[]
}
export interface CreateAdvertInput {
	title: string
	description: string
}
export interface Advert {
	id: string
	title: string
	description: string
	createdBy: string
	createdAt: string
	modifiedAt: string
}
export interface AdvertsRepository {
	getAdvert: (id: string) => Promise<Advert | null>
	list: () => Promise<Advert[]>
	create: (advert: Advert) => Promise<Advert>
}