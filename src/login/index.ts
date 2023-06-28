import { createInMemoryLoginService } from './in-memory-login-service/in-memory-login-service'
import { LoginService } from './types'

export const createLoginServicerFromEnv = (): LoginService => createInMemoryLoginService()
