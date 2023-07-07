import type { HaffaUser } from '../login/types'
import type { Profile } from '../profile/types'

export enum AdvertType {
	recycle = 'recycle',
	borrow = 'borrow',
}

export interface AdvertLocation {
	adress: string
  zipCode: string
  city: string
  country: string
}

export interface AdvertContact {
	phone: string
	email: string
}
// User editable fields in an advert
export interface AdvertUserFields {
	title: string
	description: string
	quantity: number
	images: AdvertImage[]
	unit: string
	material: string
	condition: string
	usage: string

	location: AdvertLocation
	contact: AdvertContact
}

export interface AdvertMeta {
	canEdit: boolean
	canRemove: boolean
	canBook: boolean
	canReserve: boolean,
	canCancelReservation: boolean
}

export interface AdvertMutationStatus {
	code: string
	message: string
	field: string
}

export interface AdvertMutationResult {
	status: AdvertMutationStatus|null
	advert: Advert|null
}

export interface AdvertWithMetaMutationResult {
	status: AdvertMutationStatus|null
	advert: AdvertWithMeta|null
}

export type AdvertInput = AdvertUserFields

export interface AdvertImage {
	url: string
}

export interface AdvertReservation {
	reservedBy: string
	reservedAt: string
	quantity: number
}

export interface Advert extends AdvertUserFields {
	id: string
	versionId: string,
	type: AdvertType
	createdBy: string
	createdAt: string
	modifiedAt: string,
	reservations: AdvertReservation[]
}

export type AdvertWithMeta = Advert & {meta: AdvertMeta}

export type FilterInput<T> = {
	ne?: T
	eq?: T
	gt?: T
	gte?: T
	lt?: T
	lte?: T
} & (T extends string ? {contains?: string} : Record<string, never>)

export type FilterAdvertsInput = {
	id?: FilterInput<string>
}
& {
	[Property in keyof Omit<AdvertUserFields, 'images'>]: FilterInput<AdvertUserFields[Property]>
}

export interface AdvertsRepository {
	getAdvert: (id: string) => Promise<Advert | null>
	saveAdvertVersion: (versionId: string, advert: Advert) => Promise<Advert | null>,
	list: (filter?: FilterAdvertsInput) => Promise<Advert[]>
	create: (user: HaffaUser, advert: AdvertInput) => Promise<Advert>
	update: (id: string, user: HaffaUser, advert: AdvertInput) => Promise<Advert|null>
	remove: (id: string) => Promise<Advert|null>
}

export interface AdvertMutations {
	createAdvert: (user: HaffaUser, input: AdvertInput) => Promise<AdvertMutationResult>,
	updateAdvert: (user: HaffaUser, id: string, input: AdvertInput) => Promise<AdvertMutationResult>,
	removeAdvert: (user: HaffaUser, id: string) => Promise<AdvertMutationResult>,
	reserveAdvert: (user: HaffaUser, id: string, quantity: number) => Promise<AdvertMutationResult>
	cancelAdvertReservation: (user: HaffaUser, id: string) => Promise<AdvertMutationResult>
}