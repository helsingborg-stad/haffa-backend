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

export interface IdFilterInput {
	ne?: string
	eq?: string
}
export interface StringFilterInput {
	ne?: string
	eq?: string
	gt?: string
	gte?: string
	lt?: string
	lte?: string
	contains?: string
} 
export interface FilterAdvertsInput {
	id?: IdFilterInput
	title?: StringFilterInput
	description?: StringFilterInput
}

export interface AdvertsRepository {
	getAdvert: (id: string) => Promise<Advert | null>
	list: (filter?: FilterAdvertsInput) => Promise<Advert[]>
	create: (advert: Advert) => Promise<Advert>
}