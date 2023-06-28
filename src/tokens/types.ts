import { HaffaUser } from '../login/types'

export interface TokenService {
	verify: (token: string) => boolean
	sign: (user: HaffaUser) => string
	decode: (token: string) => HaffaUser
}