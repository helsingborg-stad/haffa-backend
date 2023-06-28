import { LoginService, RequestPincodeResult } from '../types'
import ms from 'ms'

export const createInMemoryLoginService = (maxAge: number = ms('10m')): LoginService => {

	interface RequestEntry {
		pincode: string
		expires: number
	}
	const repo: Record<string, RequestEntry> = {}

	return {
		requestPincode: async (email) =>  {
			repo[email] = {
				pincode: '123456',
				expires: Date.now() + maxAge,
			}
			return RequestPincodeResult.accepted
		},
		tryLogin: async (email, pincode) => {
			const entry = repo[email]
			if (entry && (entry.pincode === pincode) && (entry.expires >= Date.now())) {
				// clear entry on successful login
				repo[email] = null
				return {
					id: email,
					roles: [],
				}
			}
			return null
		},
	}
}
