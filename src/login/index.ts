import type { UserMapper } from '../users/types'
import { createInMemoryLoginService } from './in-memory-login-service/in-memory-login-service'
import { tryCreateMongoLoginServiceFromEnv } from './mongo-login-service'
import type { LoginService } from './types'

export const createLoginServiceFromEnv = (userMapper: UserMapper): LoginService => tryCreateMongoLoginServiceFromEnv(userMapper) || createInMemoryLoginService(userMapper)
