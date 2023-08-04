import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createInMemoryLoginService } from './in-memory-login-service/in-memory-login-service'
import { tryCreateMongoLoginServiceFromEnv } from './mongo-login-service'
import { tryCreateHaffaUser } from './try-create-haffa-user'
import type { LoginService } from './types'
import { validateHaffaUser } from './validate-haffa-user'

export { tryCreateHaffaUser, validateHaffaUser }

const tryCreateFromEnvDriver = () => {
  const driver = getEnv('LOGIN_DRIVER', { fallback: '' })

  const driverMap: Record<string, () => LoginService | null> = {
    mongodb: tryCreateMongoLoginServiceFromEnv,
    memory: createInMemoryLoginService,
  }

  return driverMap[driver]?.() ?? null
}

export const createLoginServiceFromEnv = (): LoginService =>
  tryCreateFromEnvDriver() || createInMemoryLoginService()
