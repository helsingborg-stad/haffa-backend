import EmailValidator from 'email-validator'
import { HaffaUser } from './types'

const isString = v => typeof v === 'string'
const isStringOrNull = v => (v === null) || typeof v === 'string'
const isObject = v => v && (typeof v === 'object') && !isArray(v)
const isArray = v => Array.isArray(v)

export const validateHaffaUser = (user: HaffaUser): HaffaUser|null => isObject(user) 
		&& isString(user.id) 
		&& Array.isArray(user.roles) 
		&& user.roles.every(isStringOrNull)
		&& EmailValidator.validate(user.id)
		? { id: user.id, roles: user.roles.filter(v => v) }
		: null