export interface HaffaUser {
  id: string
  roles: string[]
}

export interface RequestPincodeResult {
  status: RequestPincodeStatus
  pincode: string
}

export enum RequestPincodeStatus {
  accepted = 'accepted',
  denied = 'denied',
  invalid = 'invalid',
}

export interface LoginService {
  requestPincode: (email: string, origin: string) => Promise<RequestPincodeResult>
  tryLogin: (email: string, pincode: string, origin: string) => Promise<HaffaUser | null>
}
