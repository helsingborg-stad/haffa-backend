export interface HaffaUser {
	id: string
	roles: string[]
}

export enum RequestPincodeResult {
	accepted = 'accepted',
	denied = 'denied',
	invalid = 'invalid'
}

export interface LoginService {
	requestPincode: (email: string) => Promise<RequestPincodeResult>
	tryLogin: (email: string, pincode: string) => Promise<HaffaUser | null>
}
