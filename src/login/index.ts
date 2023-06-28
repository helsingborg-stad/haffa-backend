import { createInMemoryLoginService } from './in-memory-login-service/in-memory-login-service'
import { tryCreateHaffaUser } from './try-create-haffa-user'
import { LoginService } from './types'
import { validateHaffaUser } from './validate-haffa-user'

export {
	tryCreateHaffaUser, 
	validateHaffaUser,
}

export const createLoginServicerFromEnv = (): LoginService => createInMemoryLoginService()
