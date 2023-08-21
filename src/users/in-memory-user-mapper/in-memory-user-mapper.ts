import EmailValidator from 'email-validator'
import type { HaffaUser } from "../../login/types";
import type { UserMapper } from "../types";

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

const setSuperUserRoles = async (superUser: string, user: HaffaUser|null): Promise<HaffaUser|null> => 
	/* if (user?.id === superUser) {
		return {
			...user,
			id: superUser,
			roles: ['super-admin', 'admin']
		}
	} */
	 user

export const createInMemoryUserMapper = (superUser: string): UserMapper => ({
	mapAndValidateEmail: async (email) => setSuperUserRoles(superUser, validateHaffaUser(email ? {id: email, roles: []} : null)),
	mapAndValidateUser: (user) => setSuperUserRoles(superUser, validateHaffaUser(user))
})