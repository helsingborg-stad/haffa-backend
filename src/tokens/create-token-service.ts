import jwt from 'jsonwebtoken'
import type { TokenService } from './types'
import type { HaffaUser } from '../login/types'
import type { UserMapper } from '../users/types'

const jwtOptions = {
  audience: 'urn://haffa',
  subject: 'haffa-web-client',
}

export const createTokenService = (
  userMapper: UserMapper,
  secret: string,
  defaultUser?: any
): TokenService => {
  const sign: TokenService['sign'] = user =>
    jwt.sign(user, secret, {
      ...jwtOptions,
      expiresIn: '30d',
    })

  const tryDecodeRaw = (token: string): HaffaUser|null => {
    try {
      return jwt.verify((token || '').toString(), secret, {
        ...jwtOptions,
        maxAge: '30d',
      }) as HaffaUser
    } catch {
      return null
    }
  }

  const decode: TokenService['decode'] = async token => userMapper.mapAndValidateUser(tryDecodeRaw(token))

  const verify: TokenService['verify'] = token => decode(token).then(user => !!user)

  const tryGetUserFromJwt: TokenService['tryGetUserFromJwt'] = token =>
    tryDecodeRaw(token) || defaultUser

  return {
    tryGetUserFromJwt,
    sign,
    decode,
    verify,
  }
}
