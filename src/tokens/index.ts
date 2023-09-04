import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createTokenService } from './create-token-service'
import type { TokenService } from './types'
import type { UserMapper } from '../users/types'

export { createTokenService }

const tryParseJson = (json?: string): any | null =>
  json ? JSON.parse(json) : null

export const createTokenServiceFromEnv = (
  userMapper: UserMapper
): TokenService =>
  createTokenService(
    userMapper,
    getEnv('JWT_SHARED_SECRET'),
    tryParseJson(getEnv('JWT_DEFAULT_USER', { fallback: '' }))
  )
