import { createTokenService } from './create-token-service'
import type { TokenService } from './types'
import type { UserMapper } from '../users/types'
import type { StartupLog } from '../types'
import { getEnv } from '../lib/gdi-api-node'

export { createTokenService }

const tryParseJson = (json?: string): any | null =>
  json ? JSON.parse(json) : null

export const createTokenServiceFromEnv = (
  startupLog: StartupLog,
  userMapper: UserMapper
): TokenService => {
  const secret = getEnv('JWT_SHARED_SECRET')
  const expiresIn = getEnv('JWT_EXPIRES_IN', { fallback: '30 days' })
  const jwtDefaultUser = tryParseJson(
    getEnv('JWT_DEFAULT_USER', { fallback: '' })
  )

  return startupLog.echo(
    createTokenService(
      userMapper,
      {
        secret,
        expiresIn,
      },
      jwtDefaultUser
    ),
    {
      name: 'token',
      config: {
        secret,
        expiresIn,
        jwtDefaultUser,
      },
    }
  )
}
