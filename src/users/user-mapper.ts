import EmailValidator from 'email-validator'
import type { HaffaUser, HaffaUserRoles } from '../login/types'
import type * as types from './types'
import type { SettingsService } from '../settings/types'
import { loginPolicyAdapter } from '../login-policies/login-policy-adapter'
import type { LoginPolicy } from '../login-policies/types'
import { makeAdmin, normalizeRoles, rolesArrayToRoles } from '../login'

const nanomatch = require('nanomatch')

const isString = (v: any) => typeof v === 'string'
const isObject = (v: any) => v && typeof v === 'object' && !isArray(v)
const isArray = (v: any) => Array.isArray(v)

const validateHaffaUser = (user: HaffaUser | null): HaffaUser | null =>
  user &&
  isObject(user) &&
  isString(user.id) &&
  EmailValidator.validate(user.id)
    ? { id: user.id.toString(), roles: normalizeRoles(user.roles) }
    : null

export const tryMatchEmail = (email: string, emailPattern: string): boolean =>
  nanomatch.isMatch(email, emailPattern)

const tryMatchUserPolicy = (email: string, { emailPattern }: LoginPolicy) =>
  tryMatchEmail(email, emailPattern)

const matchLoginPolicies = (email: string, policies: LoginPolicy[]) =>
  policies.filter(policy => tryMatchUserPolicy(email, policy))

export const createUserMapper = (
  superUser: string | null,
  settings: SettingsService
): types.UserMapper => {
  const su = superUser?.toLowerCase()
  const mapAndValidateUser: types.UserMapper['mapAndValidateUser'] =
    async u => {
      const user = validateHaffaUser(u)
      if (!user) {
        return null
      }
      const { id } = user
      if (id === su) {
        return makeAdmin({
          id,
        })
      }
      const loginPolicies = await loginPolicyAdapter(
        settings
      ).getLoginPolicies()
      const matchings = matchLoginPolicies(id, loginPolicies)
      if (matchings.some(({ deny }) => deny)) {
        return null
      }

      if (matchings.length === 0 && loginPolicies.length > 0) {
        return null
      }

      const roles = rolesArrayToRoles(
        matchings.reduce<string[]>(
          (combinedRoles, policy) => combinedRoles.concat(policy.roles),
          []
        )
      )
      return {
        id,
        roles,
      }
    }
  const mapAndValidateEmail: types.UserMapper['mapAndValidateEmail'] =
    async email => mapAndValidateUser({ id: email || '' })

  return {
    mapAndValidateEmail,
    mapAndValidateUser,
  }
}
