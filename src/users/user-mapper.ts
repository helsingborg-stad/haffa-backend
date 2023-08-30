import EmailValidator from 'email-validator'
import type { HaffaUser } from "../login/types";
import type * as types from "./types";
import type { SettingsService } from '../settings/types';
import { loginPolicyAdapter } from '../login-policies/login-policy-adapter';
import type { LoginPolicy } from '../login-policies/types';

const isString = (v: any) => typeof v === 'string'
const isStringOrNull = (v: any) => (v === null) || typeof v === 'string'
const isObject = (v: any) => v && (typeof v === 'object') && !isArray(v)
const isArray = (v: any) => Array.isArray(v)

const validateHaffaUser = (user: HaffaUser|null): HaffaUser|null => user 
	&& isObject(user) 
	&& isString(user.id) 
	&& Array.isArray(user.roles) 
	&& user.roles.every(isStringOrNull)
	&& EmailValidator.validate(user.id)
	? { id: user.id, roles: user.roles.filter(v => v) }
	: null

const tryMatchUserPolicy = (email: string, {emailPattern}: LoginPolicy) => new RegExp(`^${emailPattern}$`).test(email)
const matchLoginPolicies = (email: string, policies: LoginPolicy[]) => 
	policies.filter(policy => tryMatchUserPolicy(email, policy))


export const createUserMapper = (settings: SettingsService): types.UserMapper => {
	const mapAndValidateUser: types.UserMapper['mapAndValidateUser'] = async (user) => {
		const id = user?.id
		if (!id) {
			return null
		}
		if (settings.isSuperUser(id)) {
			return validateHaffaUser({
				id,
				roles: ['admin']
			})
		}
		const loginPolicies = await loginPolicyAdapter(settings).getLoginPolicies()
		const matchings = matchLoginPolicies(id, loginPolicies)
		if (matchings.some(({deny}) => deny)) {
			return null
		}

		if ((matchings.length === 0) && (loginPolicies.length > 0)) {
			return null
		}

		const roles = matchings.reduce((r, policy) => r.concat(policy.roles), user.roles || [])
		return validateHaffaUser({
			id,
			roles: Array.from(new Set(roles))
		})
	}
	const mapAndValidateEmail: types.UserMapper['mapAndValidateEmail'] = async (email) => mapAndValidateUser({id: email||'', roles: []})

	return {
		mapAndValidateEmail,
		mapAndValidateUser
	}
}