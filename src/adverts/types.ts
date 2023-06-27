export interface AdvertsUser {
	id: string
	roles: string[]
}

export interface AdvertPermissions {
	edit: boolean
	delete: boolean
	book: boolean
	claim: boolean
}

export interface AdvertInput {
	title: string
	description: string
	images: AdvertImage[]
	unit: string
	material: string
	condition: string
	usage: string
}

export interface AdvertImage {
	url: string
}

export interface Advert {
	id: string
	createdBy: string
	createdAt: string
	modifiedAt: string

	title: string
	description: string
	images: AdvertImage[]
	unit: string
	material: string
	condition: string
	usage: string
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
	create: (user: AdvertsUser, advert: AdvertInput) => Promise<Advert>
	update: (id: string, user: AdvertsUser, advert: AdvertInput) => Promise<Advert|null>
}