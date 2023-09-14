import type { StartupLog } from '../types'
import type { UserMapper } from '../users/types'
import { createInMemoryLoginServiceFromEnv } from './in-memory-login-service'
import { tryCreateMongoLoginServiceFromEnv } from './mongo-login-service'
import type { HaffaUser, LoginService } from './types'

export const createLoginServiceFromEnv = (
  startupLog: StartupLog,
  userMapper: UserMapper
): LoginService =>
  tryCreateMongoLoginServiceFromEnv(startupLog, userMapper) ||
  createInMemoryLoginServiceFromEnv(startupLog, userMapper)

export const isAdmin = (user: HaffaUser): boolean =>
  user.roles.includes('admin')

export const makeUser = (
  u: Partial<HaffaUser> & Pick<HaffaUser, 'id'>
): HaffaUser => ({
  roles: [],
  ...u,
})

export const makeAdmin = (u: Partial<HaffaUser>): HaffaUser => ({
  id: '',
  ...u,
  roles: ['admin'],
})
