import jwt from 'jsonwebtoken'
import { TokenService } from './types'
import { HaffaUser } from '../login/types'
import { validateHaffaUser } from '../login'

const jwtOptions = {
	audience: 'urn://haffa',
	subject: 'haffa-web-client',
} 

export const createTokenService = (secret: string, defaultUser?: any): TokenService => {
	const sign: TokenService['sign'] = user => jwt.sign(
		user,
		secret,
		{
			...jwtOptions,
			expiresIn: '30d',
		})

	const decode: TokenService['decode'] = token => {
		try {
			const user = jwt.verify((token || '').toString(), secret, {
				...jwtOptions,
				maxAge: '30d',
			}) as HaffaUser
			return validateHaffaUser(user)
		} catch (e) {
			return null
		}
	}

	const verify: TokenService['verify'] = token => !!decode(token)

	const tryGetUserFromJwt: TokenService['tryGetUserFromJwt'] = token => decode(token) || validateHaffaUser(defaultUser)

	return {
		tryGetUserFromJwt,
		sign,
		decode,
		verify,
	}
}