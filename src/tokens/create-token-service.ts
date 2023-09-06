import jwt from 'jsonwebtoken'
import type { TokenService } from './types'
import type { HaffaUser } from '../login/types'
import type { UserMapper } from '../users/types'

const jwtOptions = {
  audience: 'urn://haffa',
  subject: 'haffa-web-client',
}

export interface TokenServiceConfig {
  secret: string
  expiresIn?: string
}
export const createTokenService = (
  userMapper: UserMapper,
  { secret, expiresIn }: TokenServiceConfig,
  defaultUser?: any
): TokenService => {
  const ttl = expiresIn || '30d'

  const sign: TokenService['sign'] = user =>
    jwt.sign(user, secret, {
      ...jwtOptions,
      expiresIn: ttl,
    })

  const tryDecodeRaw = (token: string): HaffaUser | null => {
    try {
      return jwt.verify((token || '').toString(), secret, {
        ...jwtOptions,
        maxAge: ttl,
      }) as HaffaUser
    } catch {
      return null
    }
  }

  const decode: TokenService['decode'] = async token =>
    userMapper.mapAndValidateUser(tryDecodeRaw(token))

  const verify: TokenService['verify'] = token =>
    decode(token).then(user => !!user)

  const tryGetUserFromJwt: TokenService['tryGetUserFromJwt'] = token =>
    tryDecodeRaw(token) || defaultUser

  return {
    tryGetUserFromJwt,
    sign,
    decode,
    verify,
  }
}
