import ms from 'ms'
import { validateHaffaUser } from '../validate-haffa-user'
import type { LoginService} from '../types';
import { RequestPincodeResult } from '../types'

interface Options {
	maxAge: number
	db: Record<string, LoginRequestEntry|null>
}

export interface LoginRequestEntry {
	pincode: string
	expires: number
}

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
