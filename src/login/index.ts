import { toMap } from '../lib'
import type { StartupLog } from '../types'
import type { UserMapper } from '../users/types'
import { createInMemoryLoginServiceFromEnv } from './in-memory-login-service'
import { tryCreateMongoLoginServiceFromEnv } from './mongo-login-service'
import type { HaffaUser, HaffaUserRoles, LoginService } from './types'

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

export const normalizeRoles = (
  roles?: HaffaUserRoles
): Required<HaffaUserRoles> => ({
  canEditOwnAdverts: !!roles?.canEditOwnAdverts,
  canArchiveOwnAdverts: !!roles?.canArchiveOwnAdverts,
  canRemoveOwnAdverts: !!roles?.canRemoveOwnAdverts,
  canReserveAdverts: !!roles?.canReserveAdverts,
  canCollectAdverts: !!roles?.canCollectAdverts,
  canManageOwnAdvertsHistory: !!roles?.canManageOwnAdvertsHistory,
  canManageAllAdverts: !!roles?.canManageAllAdverts,
  canEditSystemCategories: !!roles?.canEditSystemCategories,
  canEditSystemLoginPolicies: !!roles?.canEditSystemLoginPolicies,
  canRunSystemJobs: !!roles?.canRunSystemJobs,
})

export const createLoginServiceFromEnv = (
  startupLog: StartupLog,
  userMapper: UserMapper
): LoginService =>
  tryCreateMongoLoginServiceFromEnv(startupLog, userMapper) ||
  createInMemoryLoginServiceFromEnv(startupLog, userMapper)

export const makeRoles = (
  defaultEnabled: boolean = false
): Required<HaffaUserRoles> => ({
  canEditOwnAdverts: defaultEnabled,
  canArchiveOwnAdverts: defaultEnabled,
  canRemoveOwnAdverts: defaultEnabled,
  canReserveAdverts: defaultEnabled,
  canCollectAdverts: defaultEnabled,
  canManageOwnAdvertsHistory: defaultEnabled,
  canManageAllAdverts: defaultEnabled,
  canEditSystemCategories: defaultEnabled,
  canEditSystemLoginPolicies: defaultEnabled,
  canRunSystemJobs: defaultEnabled,
})

export const combineRoles = (
  a: HaffaUserRoles,
  b: HaffaUserRoles
): Required<HaffaUserRoles> =>
  normalizeRoles({
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
  })

export const makeUser = (
  u: Partial<HaffaUser> & Pick<HaffaUser, 'id'>
): HaffaUser => ({
  roles: makeRoles(),
  ...u,
})

export const makeAdmin = (u: Partial<HaffaUser>): HaffaUser => ({
  id: '',
  ...u,
  roles: makeRoles(true),
})
