import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createTokenService } from './create-token-service'
import { TokenService } from './types'

export { createTokenService }

const tryParseJson = (json?: string): any | null => json ? JSON.parse(json) : null

export const createTokenServiceFromEnv = (): TokenService => createTokenService(getEnv('JWT_SHARED_SECRET'), tryParseJson(getEnv('JWT_DEFAULT_USER',{ fallback: '' })))
