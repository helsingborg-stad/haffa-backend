import ms from 'ms'
import { validateHaffaUser } from '../validate-haffa-user'
import type { LoginService} from '../types';
import { RequestPincodeResult } from '../types'
import type { NotificationService } from '../../notifications/types';

interface Options {
	maxAge: number
	db: Record<string, LoginRequestEntry|null>,
	notifications?: NotificationService
}

export interface LoginRequestEntry {
	pincode: string
	expires: number
}

const issuePinCode = () => '123456'

export const createInMemoryLoginService = (options?: Partial<Options>): LoginService => {
	const { maxAge, db, notifications }: Options = {
		db: {},
		maxAge: ms('10m'),
		...options,
	}
	return {
		requestPincode: async (email) =>  {
			const pincode = issuePinCode()
			db[email] = {
				pincode,
				expires: Date.now() + maxAge,
			}
			await notifications?.pincodeRequested(email, pincode)
			
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
