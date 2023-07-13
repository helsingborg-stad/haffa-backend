import ms from 'ms'
import { validateHaffaUser } from '../validate-haffa-user'
import type { LoginService} from '../types';
import { RequestPincodeStatus } from '../types'
import { issuePincode } from '../issue-pincode';

interface Options {
	maxAge: number
	db: Record<string, LoginRequestEntry|null>,
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
			const pincode = issuePincode()
			db[email] = {
				pincode,
				expires: Date.now() + maxAge,
			}
			
			return {
				status: RequestPincodeStatus.accepted,
				pincode
			}
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
