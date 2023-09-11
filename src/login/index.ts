import type { UserMapper } from '../users/types'
import { createInMemoryLoginService } from './in-memory-login-service/in-memory-login-service'
import { tryCreateMongoLoginServiceFromEnv } from './mongo-login-service'
import type { HaffaUser, LoginService } from './types'

export const createLoginServiceFromEnv = (
  userMapper: UserMapper
): LoginService =>
  tryCreateMongoLoginServiceFromEnv(userMapper) ||
  createInMemoryLoginService(userMapper)

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
