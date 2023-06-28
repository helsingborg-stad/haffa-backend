import * as uuid from 'uuid'
import { Advert, AdvertInput } from './types'
import { HaffaUser } from '../login/types'

export const mapCreateAdvertInputToAdvert = (input: AdvertInput, user: HaffaUser, when: string = new Date().toISOString()): Advert => ({
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