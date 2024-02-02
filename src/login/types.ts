import type Koa from 'koa'

export interface HaffaUser {
  id: string
  roles?: HaffaUserRoles
  guest?: boolean
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
  canSeeSystemStatistics?: boolean
  canManageContent?: boolean
  canManageLocations?: boolean
  canManageNotifications?: boolean
  canManageReturns?: boolean
}

export interface RequestPincodeResult {
  status: RequestPincodeStatus
  pincode: string
  user: HaffaUser | null
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
