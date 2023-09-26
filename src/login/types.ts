/* export enum HaffaRole  {
  admin = 'admin', // can do everything


  canCreateAdvert='can-create-advert',
  canArchive='can-archive',
  canRemove='can-remove',
  canBook='can-book',
  canReserve='can-reserve',
  canCollect='can-collect',


  advertAdmin='advert-admin',
} */
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
  canManageAllAdverts?: boolean
  canEditSystemCategories?: boolean
  canEditSystemLoginPolicies?: boolean
  canEditApiKeys?: boolean
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
