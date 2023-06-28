import jwt from 'jsonwebtoken'
import { TokenService } from './types'
import { HaffaUser } from '../login/types'
import { validateHaffaUser } from '../login'

const jwtOptions = {
	audience: 'urn://haffa',
	subject: 'haffa-web-client',
} 

export const createTokenService = (secret: string): TokenService => {
	
	const sign: TokenService['sign'] = user => jwt.sign(
		user,
		secret,
		{
			...jwtOptions,
			algorithm: 'HS512',
			expiresIn: '30d',
		})

	const decode: TokenService['decode'] = token => {
		try {
			const user = jwt.verify((token || '').toString(), secret, {
				...jwtOptions,
				algorithms: ['HS512'],
				maxAge: '30d',
			}) as HaffaUser
			return validateHaffaUser(user)
		} catch {
			return null
		}
	}

	const verify: TokenService['verify'] = token => !!decode(token)

	return {
		sign,
		decode,
		verify,
	}
}