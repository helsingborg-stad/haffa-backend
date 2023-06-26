export enum RequestPincodeResult {
	accepted = 'accepted',
	denied = 'denied',
	invalid = 'invalid'
}

export interface LoginResult {
	email: string
	roles: string[]
}

export interface LoginService {
	requestPincode: (email: string) => Promise<RequestPincodeResult>
	tryLogin: (email: string, pincode: string) => Promise<LoginResult | null>
}