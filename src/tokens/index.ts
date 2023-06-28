import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createTokenService } from './create-token-service'
import { TokenService } from './types'

export { createTokenService }

export const createTokenServiceFromEnv = (): TokenService => createTokenService(getEnv('JWT_SHARED_SECRET'))