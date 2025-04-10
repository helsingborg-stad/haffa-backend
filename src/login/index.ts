import { toMap } from '../lib'
import type { StartupLog } from '../types'
import type { UserMapper } from '../users/types'
import { createInMemoryLoginServiceFromEnv } from './in-memory-login-service'
import { tryCreateMongoLoginServiceFromEnv } from './mongo-login-service'
import type { HaffaUser, HaffaUserRoles, LoginService } from './types'
import { createIssuePincode } from './issue-pincode'
import { createCookieService, createCookieServiceFromEnv } from './cookies'

export { createIssuePincode }
export { createCookieService, createCookieServiceFromEnv }

export const GUEST_USER_ID = 'guest'

export const rolesToRolesArray = (roles?: HaffaUserRoles) =>
  Object.entries(normalizeRoles(roles))
    .filter(([, enabled]) => enabled)
    .map(([roleName]) => roleName)

export const rolesArrayToRoles = (roles: string[]): HaffaUserRoles =>
  Array.isArray(roles)
    ? normalizeRoles(
        toMap(
          roles,
          role => role,
          () => true
        )
      )
    : {}

const strict = <T>(value: Required<T>): Required<T> => value

export const normalizeRoles = (
  roles?: HaffaUserRoles
): Required<HaffaUserRoles> => ({
  canEditOwnAdverts: !!roles?.canEditOwnAdverts,
  canArchiveOwnAdverts: !!roles?.canArchiveOwnAdverts,
  canRemoveOwnAdverts: !!roles?.canRemoveOwnAdverts,
  canReserveAdverts: !!roles?.canReserveAdverts,
  canCollectAdverts: !!roles?.canCollectAdverts,
  canManageOwnAdvertsHistory: !!roles?.canManageOwnAdvertsHistory,
  canSubscribe: !!roles?.canSubscribe,
  canJoinWaitlist: !!roles?.canJoinWaitlist,
  canManageAllAdverts: !!roles?.canManageAllAdverts,
  canEditSystemCategories: !!roles?.canEditSystemCategories,
  canEditSystemLoginPolicies: !!roles?.canEditSystemLoginPolicies,
  canEditApiKeys: !!roles?.canEditApiKeys,
  canEditTerms: !!roles?.canEditTerms,
  canRunSystemJobs: !!roles?.canRunSystemJobs,
  canSeeSystemStatistics: !!roles?.canSeeSystemStatistics,
  canManageContent: !!roles?.canManageContent,
  canManageLocations: !!roles?.canManageLocations,
  canManageNotifications: !!roles?.canManageNotifications,
  canManageReturns: !!roles?.canManageReturns,
  canManagePicked: !!roles?.canManagePicked,
  canManageProfile: !!roles?.canManageProfile,
  canUseQRCode: !!roles?.canUseQRCode,
})

export const createLoginServiceFromEnv = (
  startupLog: StartupLog,
  userMapper: UserMapper
): LoginService =>
  tryCreateMongoLoginServiceFromEnv(startupLog, userMapper) ||
  createInMemoryLoginServiceFromEnv(startupLog, userMapper)

export const makeRoles = (
  defaultEnabled: boolean = false
): Required<HaffaUserRoles> =>
  strict({
    canEditOwnAdverts: defaultEnabled,
    canArchiveOwnAdverts: defaultEnabled,
    canRemoveOwnAdverts: defaultEnabled,
    canReserveAdverts: defaultEnabled,
    canCollectAdverts: defaultEnabled,
    canManageOwnAdvertsHistory: defaultEnabled,
    canSubscribe: defaultEnabled,
    canJoinWaitlist: defaultEnabled,
    canManageAllAdverts: defaultEnabled,
    canEditSystemCategories: defaultEnabled,
    canEditSystemLoginPolicies: defaultEnabled,
    canEditApiKeys: defaultEnabled,
    canEditTerms: defaultEnabled,
    canRunSystemJobs: defaultEnabled,
    canSeeSystemStatistics: defaultEnabled,
    canManageContent: defaultEnabled,
    canManageLocations: defaultEnabled,
    canManageNotifications: defaultEnabled,
    canManageReturns: defaultEnabled,
    canManagePicked: defaultEnabled,
    canManageProfile: defaultEnabled,
    canUseQRCode: defaultEnabled,
  })

export const combineRoles = (
  a: HaffaUserRoles,
  b: HaffaUserRoles
): Required<HaffaUserRoles> =>
  normalizeRoles(
    strict({
      canEditOwnAdverts: a.canEditOwnAdverts || b.canEditOwnAdverts,
      canArchiveOwnAdverts: a.canArchiveOwnAdverts || b.canArchiveOwnAdverts,
      canRemoveOwnAdverts: a.canRemoveOwnAdverts || b.canRemoveOwnAdverts,
      canReserveAdverts: a.canReserveAdverts || b.canReserveAdverts,
      canCollectAdverts: a.canCollectAdverts || b.canCollectAdverts,
      canManageOwnAdvertsHistory:
        a.canManageOwnAdvertsHistory || b.canManageOwnAdvertsHistory,
      canManageAllAdverts: a.canManageAllAdverts || b.canManageAllAdverts,
      canEditSystemCategories:
        a.canEditSystemCategories || b.canEditSystemCategories,
      canEditSystemLoginPolicies:
        a.canEditSystemLoginPolicies || b.canEditSystemLoginPolicies,
      canEditApiKeys: a.canEditApiKeys || b.canEditApiKeys,
      canEditTerms: a.canEditTerms || b.canEditTerms,
      canRunSystemJobs: a.canRunSystemJobs || b.canRunSystemJobs,
      canManageContent: a.canManageContent || b.canManageContent,
      canManageLocations: a.canManageLocations || b.canManageLocations,
      canManageNotifications:
        a.canManageNotifications || b.canManageNotifications,
      canManageReturns: a.canManageReturns || b.canManageReturns,
      canManagePicked: a.canManagePicked || b.canManagePicked,
      canManageProfile: a.canManageProfile || b.canManageProfile,
      canUseQrCode: a.canUseQRCode || b.canUseQRCode,
    })
  )

export const makeUser = (
  u: Partial<HaffaUser> & Pick<HaffaUser, 'id'>
): HaffaUser => ({
  roles: makeRoles(),
  ...u,
})

export const makeGuestUser = (): HaffaUser => ({
  id: GUEST_USER_ID,
  roles: makeRoles(),
  guest: true,
})

export const makeAdmin = (u: Partial<HaffaUser>): HaffaUser => ({
  id: '',
  ...u,
  roles: makeRoles(true),
})

export const elevateUser = (
  u: HaffaUser,
  elevation: Partial<HaffaUserRoles>
): HaffaUser => ({
  ...u,
  roles: {
    ...u.roles,
    ...elevation,
  },
})
