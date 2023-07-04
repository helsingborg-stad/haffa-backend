import type { HaffaUser } from './types'
import { validateHaffaUser } from './validate-haffa-user'

export const tryCreateHaffaUser = (user: any): HaffaUser | null => validateHaffaUser(user)

