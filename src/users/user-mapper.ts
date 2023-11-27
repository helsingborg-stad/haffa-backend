import EmailValidator from 'email-validator'
import type { HaffaUser } from '../login/types'
import type { SettingsService } from '../settings/types'
import { loginPolicyAdapter } from '../login-policies/login-policy-adapter'
import type { LoginPolicy } from '../login-policies/types'
import { makeAdmin, normalizeRoles, rolesArrayToRoles } from '../login'
import type { UserMapper } from './types'
import { userMapperConfigAdapter } from './user-mapper-config-adapter'

export const GUEST_USER_ID = 'guest'

const nanomatch = require('nanomatch')

const isString = (v: any) => typeof v === 'string'
const isObject = (v: any) => v && typeof v === 'object' && !isArray(v)
const isArray = (v: any) => Array.isArray(v)

const isGuest = (id: string) => id === GUEST_USER_ID

const isValidUserId = (id: string) => isGuest(id) || isValidEmail(id)

const validateHaffaUser = (user: HaffaUser | null): HaffaUser | null =>
  user && isObject(user) && isString(user.id) && isValidUserId(user.id)
    ? { id: user.id, roles: normalizeRoles(user.roles) }
    : null

export const isValidEmail = (email: string) => EmailValidator.validate(email)

export const tryMatchEmail = (email: string, emailPattern: string): boolean =>
  nanomatch.isMatch(email, emailPattern)

const tryMatchUserPolicy = (email: string, { emailPattern }: LoginPolicy) =>
  tryMatchEmail(email, emailPattern)

const matchLoginPolicies = (email: string, policies: LoginPolicy[]) =>
  policies.filter(policy => tryMatchUserPolicy(email, policy))

export const createUserMapper = (
  superUser: string | null,
  settings: SettingsService
): UserMapper => {
  const su = superUser?.toLowerCase()

  const canHaveGuests = async () =>
    userMapperConfigAdapter(settings)
      .getUserMapperConfig()
      .then(({ allowGuestUsers }) => !!allowGuestUsers)
  /*
  const tryCreateGuestUser: UserMapper['tryCreateGuestUser'] = async () => ({
    id: 'guest',
    roles: {},
  })
*/
  const makeGuestUser = (): HaffaUser => ({
    id: GUEST_USER_ID,
    roles: normalizeRoles({}),
    guest: true,
  })

  const tryCreateGuestToken: UserMapper['tryCreateGuestToken'] = tokenService =>
    canHaveGuests().then(allow =>
      allow ? tokenService.sign({ id: GUEST_USER_ID }) : Promise.resolve(null)
    )

  const tryCreateGuestUser: UserMapper['tryCreateGuestUser'] = async () =>
    canHaveGuests().then(allow => (allow ? makeGuestUser() : null))

  const mapAndValidateUsers: UserMapper['mapAndValidateUsers'] =
    async users => {
      const effectiveUsers = users.filter(u => u && u.id).map(u => u!)
      if (effectiveUsers.length === 0) {
        return []
      }
      const loginPolicies = await loginPolicyAdapter(
        settings
      ).getLoginPolicies()
      const allowGuest = await canHaveGuests()
      return effectiveUsers
        .map(u => {
          const user = validateHaffaUser(u)
          if (!user) {
            return null
          }
          const { id } = user

          if (id === GUEST_USER_ID && allowGuest) {
            return makeGuestUser()
          }

          if (id === su) {
            return makeAdmin({
              id,
            })
          }

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
        })
        .filter(u => u)
        .map(u => u!)
    }

  const mapAndValidateEmails: UserMapper['mapAndValidateEmails'] =
    async emails =>
      mapAndValidateUsers(emails.map(email => ({ id: email || '' })))

  const mapAndValidateUser: UserMapper['mapAndValidateUser'] = async u => {
    const [mapped] = await mapAndValidateUsers([u])
    return mapped || null
  }
  const mapAndValidateEmail: UserMapper['mapAndValidateEmail'] = async email =>
    mapAndValidateUser({ id: email || '' })

  return {
    tryCreateGuestToken,
    tryCreateGuestUser,
    mapAndValidateUsers,
    mapAndValidateEmails,
    mapAndValidateEmail,
    mapAndValidateUser,
  }
}
