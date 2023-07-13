import { createInMemoryLoginService } from './in-memory-login-service/in-memory-login-service'
import { tryCreateMongoLoginServiceFromEnv } from './mongo-login-service'
import { tryCreateHaffaUser } from './try-create-haffa-user'
import type { LoginService } from './types'
import { validateHaffaUser } from './validate-haffa-user'

export {
	tryCreateHaffaUser, 
	validateHaffaUser,
}

export const createLoginServiceFromEnv = (): LoginService => tryCreateMongoLoginServiceFromEnv() || createInMemoryLoginService()