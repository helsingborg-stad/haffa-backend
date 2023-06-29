import { validateHaffaUser } from '..'
import { LoginService, RequestPincodeResult } from '../types'
import ms from 'ms'

interface RequestEntry {
	pincode: string
	expires: number
}

interface Options {
	maxAge: number
	db: InMemoryLoginDatabase
}

export type InMemoryLoginDatabase = Record<string, RequestEntry>

export const createInMemoryLoginService = (options?: Partial<Options>): LoginService => {
	const { maxAge, db }: Options = {
		db: {},
		maxAge: ms('10m'),
		...options,
	}

	return {
		requestPincode: async (email) =>  {
			db[email] = {
				pincode: '123456',
				expires: Date.now() + maxAge,
			}
			return RequestPincodeResult.accepted
		},
		tryLogin: async (email, pincode) => {
			const entry = db[email]
			if (entry && (entry.pincode === pincode) && (entry.expires >= Date.now())) {
				// clear entry on successful login
				db[email] = null
				return validateHaffaUser({
					id: email,
					roles: [],
				})
			}
			return null
		},
	}
}
