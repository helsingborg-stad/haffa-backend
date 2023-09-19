import { normalizeRoles, rolesToRolesArray } from '../login'
import type { SettingsService } from '../settings/types'
import type { LoginPolicy } from './types'

export const loginPolicyAdapter = (settings: SettingsService) => ({
  getLoginPolicies: () =>
    settings
      .getSetting<LoginPolicy[]>('login-policies')
      .then(normalizeLoginPolicies),
  updateLoginPolicies: (policies: Partial<LoginPolicy>[]) =>
    settings.updateSetting<LoginPolicy[]>(
      'login-policies',
      normalizeLoginPolicies(policies)
    ),
})

const normalizeLoginPolicy = (p?: Partial<LoginPolicy>): LoginPolicy => ({
  emailPattern: '',
  roles: [],
  deny: false,
  ...p,
})

const normalizeStringArray = (a: any) =>
  Array.isArray(a) ? a.filter(v => typeof v === 'string').filter(v => v) : []

const normalizeLoginPolicies = (
  policies: Partial<LoginPolicy>[] | null | undefined
): LoginPolicy[] =>
  (Array.isArray(policies) ? policies : [])
    .map(normalizeLoginPolicy)
    .map(({ emailPattern, roles, deny }) => ({
      emailPattern: (emailPattern || '').trim().toLowerCase(),
      roles: normalizeStringArray(roles),
      deny,
    }))
    .filter(({ emailPattern }) => emailPattern)
