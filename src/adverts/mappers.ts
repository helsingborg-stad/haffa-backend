import * as uuid from 'uuid'
import { Advert, AdvertsUser, AdvertInput } from './types'

const validate = (test: boolean, errorMessage: string): boolean => {
	if (!test) {
		throw new Error(errorMessage)
	}
	return true
}

export const mapContextUserToUser = (user: any): AdvertsUser => ({
	id: validate(user && typeof user.id === 'string', 'Expected user.id from JWT to be string') && user.id,
	roles: validate(user && Array.isArray(user.roles) && user.roles.every(role => typeof role === 'string'), 'Expected user.roles from JWT to be string[]') && user.roles,
})

export const mapCreateAdvertInputToAdvert = (input: AdvertInput, user: AdvertsUser, when: string = new Date().toISOString()): Advert => ({
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