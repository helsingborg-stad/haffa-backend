import * as uuid from 'uuid'
import { Advert, AdvertInput, AdvertType } from './types'
import { HaffaUser } from '../login/types'

export const createEmptyAdvert = (): Advert => ({
	id: '',
	type: AdvertType.recycle,
	createdBy: '',
	createdAt: new Date(0).toISOString(),
	modifiedAt: new Date(0).toISOString(),
	title: '',
	description: '',
	quantity: 1,
	images: [],
	
	unit: '',
	material: '',
	condition: '',
	usage: '',
})

export const createEmptyAdvertInput = (): AdvertInput => ({
	title: '',
	description: '',
	quantity: 1,
	images: [],
	
	unit: '',
	material: '',
	condition: '',
	usage: '',
})

export const mapCreateAdvertInputToAdvert = (input: AdvertInput, user: HaffaUser, when: string = new Date().toISOString()): Advert => ({
	...createEmptyAdvert(),
	id: uuid.v4().toString(), 
	createdBy: user.id, 
	createdAt: when, 
	modifiedAt: when, 
	...input, 
})

export const patchAdvertWithAdvertInput = (advert: Advert, input: AdvertInput): Advert => ({
	...advert,
	...input,
	modifiedAt: new Date().toISOString(),
})