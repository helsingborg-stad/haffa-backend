import { HaffaUser } from './types'

const isString = v => typeof v === 'string'

export const tryCreateHaffaUser = (user: any): HaffaUser | null => {
	const { id, roles } = user || {}

	return isString(id) && Array.isArray(roles) && roles.every(isString)
		? { id, roles }
		: null
}
