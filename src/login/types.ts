import type Koa from 'koa'

export interface HaffaUser {
  id: string
  roles?: HaffaUserRoles
}

export interface HaffaUserRoles {
  canEditOwnAdverts?: boolean
  canArchiveOwnAdverts?: boolean
  canRemoveOwnAdverts?: boolean
  canReserveAdverts?: boolean
  canCollectAdverts?: boolean
  canManageOwnAdvertsHistory?: boolean
  canSubscribe?: boolean
  canManageAllAdverts?: boolean
  canEditSystemCategories?: boolean
  canEditSystemLoginPolicies?: boolean
  canEditApiKeys?: boolean
  canEditTerms?: boolean
  canRunSystemJobs?: boolean
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
  requestPincode: (
    email: string,
    origin: string
  ) => Promise<RequestPincodeResult>
  tryLogin: (
    email: string,
    pincode: string,
    origin: string
  ) => Promise<HaffaUser | null>
}

export interface CookieService {
  getTokenFromCookie: (ctx: Koa.Context) => string
  setCookieToken: (ctx: Koa.Context, token: string) => any
}
