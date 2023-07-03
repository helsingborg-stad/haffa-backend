import jwt from 'jsonwebtoken'
import type { Application } from '@helsingborg-stad/gdi-api-node'
import type { Services } from '../types'
import { createInMemoryLoginService } from '../login/in-memory-login-service/in-memory-login-service'
import { createInMemoryAdvertsRepository } from '../adverts/in-memory-adverts-repository'
import { createAccessService } from '../access'
import { createNullFileService } from '../files/null-file-service'
import type { HaffaUser } from '../login/types'
import { createApp } from '../create-app'
import { createTokenService } from '../tokens'
import { createInMemoryProfileRepository } from '../profile'

export const TEST_SHARED_SECRET = 'shared scret used in tests'

export const createAuthorizationHeadersFor = (
  user: HaffaUser,
  secret: string = TEST_SHARED_SECRET
): { authorization: string } => ({
  authorization: `Bearer ${jwt.sign(user, secret)}`,
})

export const createTestServices = (services: Partial<Services>): Services => ({
  login: createInMemoryLoginService(),
  tokens: createTokenService(TEST_SHARED_SECRET),
  adverts: createInMemoryAdvertsRepository(),
  profiles: createInMemoryProfileRepository(),
  access: createAccessService(),
  files: createNullFileService(),
  ...services,
})

export const createTestApp = (services: Partial<Services>): Application =>
  createApp({
    services: createTestServices(services),
    validateResponse: true,
  })
