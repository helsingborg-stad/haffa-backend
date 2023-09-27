import jwt from 'jsonwebtoken'
import type { Application } from '@helsingborg-stad/gdi-api-node'
import type { Services } from '../types'
import { createInMemoryLoginService } from '../login/in-memory-login-service/in-memory-login-service'
import { createInMemoryAdvertsRepository } from '../adverts/in-memory-adverts-repository'
import { createNullFileService } from '../files/null-file-service'
import type { HaffaUser } from '../login/types'
import { createApp } from '../create-app'
import { createTokenService } from '../tokens'
import { createInMemoryProfileRepository } from '../profile'
import { createNullNotificationService } from '../notifications'
import type { NotificationService } from '../notifications/types'
import { createUserMapper } from '../users'
import { createInMemorySettingsService } from '../settings'
import { createJobExecutorServiceFromEnv } from '../jobs'
import { createIssuePincode } from '../login'

export const TEST_SHARED_SECRET = 'shared scret used in tests'

export const createAuthorizationHeadersFor = (
  user: HaffaUser,
  secret: string = TEST_SHARED_SECRET
): { authorization: string } => ({
  authorization: `Bearer ${jwt.sign(user, secret)}`,
})

const unexpectedInvocation = (message: string) => () => {
  throw new Error(message)
}

export const createTestNotificationServices = (
  notifications: Partial<NotificationService>
): NotificationService => ({
  pincodeRequested: unexpectedInvocation(
    'NotificationService::pincodeRequested'
  ),
  advertWasReserved: unexpectedInvocation(
    'NotificationService::advertWasReserved'
  ),
  advertReservationWasCancelled: unexpectedInvocation(
    'NotificationService::advertReservationWasCancelled'
  ),
  advertWasCollected: unexpectedInvocation(
    'NotificationService::advertWasCollected'
  ),
  advertNotCollected: unexpectedInvocation(
    'NotificationService::advertNotCollected'
  ),
  ...notifications,
})

export const createTestServices = (services: Partial<Services>): Services => {
  const settings = services.settings || createInMemorySettingsService()
  const userMapper = services.userMapper || createUserMapper(null, settings)
  return {
    userMapper,
    settings,
    login: createInMemoryLoginService(userMapper, createIssuePincode('123456')),
    tokens: createTokenService(userMapper, { secret: TEST_SHARED_SECRET }),
    adverts: createInMemoryAdvertsRepository(),
    profiles: createInMemoryProfileRepository(),
    files: createNullFileService(),
    notifications: createNullNotificationService(),
    jobs: createJobExecutorServiceFromEnv(),
    ...services,
  }
}

export const createTestApp = (services: Partial<Services>): Application =>
  createApp({
    services: createTestServices(services),
    validateResponse: true,
  })
