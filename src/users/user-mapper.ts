import EmailValidator from 'email-validator'
import type { HaffaUser } from '../login/types'
import type * as types from './types'
import type { SettingsService } from '../settings/types'
import { loginPolicyAdapter } from '../login-policies/login-policy-adapter'
import type { LoginPolicy } from '../login-policies/types'
import { makeAdmin } from '../login'

const isString = (v: any) => typeof v === 'string'
const isStringOrNull = (v: any) => v === null || typeof v === 'string'
const isObject = (v: any) => v && typeof v === 'object' && !isArray(v)
const isArray = (v: any) => Array.isArray(v)

const validateHaffaUser = (user: HaffaUser | null): HaffaUser | null =>
  user &&
  isObject(user) &&
  isString(user.id) &&
  Array.isArray(user.roles) &&
  user.roles.every(isStringOrNull) &&
  EmailValidator.validate(user.id)
    ? { id: user.id.toString(), roles: user.roles.filter(v => v) }
    : null

const tryMatchUserPolicy = (email: string, { emailPattern }: LoginPolicy) =>
  new RegExp(`^${emailPattern}$`).test(email)
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

      const roles = matchings.reduce<string[]>(
        (r, policy) => r.concat(policy.roles),
        []
      )
      return {
        id,
        roles: Array.from(new Set(roles)),
      }
    }
  const mapAndValidateEmail: types.UserMapper['mapAndValidateEmail'] =
    async email => mapAndValidateUser({ id: email || '', roles: [] })

  return {
    mapAndValidateEmail,
    mapAndValidateUser,
  }
}
