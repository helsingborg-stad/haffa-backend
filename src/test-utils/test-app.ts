import jwt from 'jsonwebtoken'
import type { Application } from '@helsingborg-stad/gdi-api-node'
import type { Services } from '../types'
import { createInMemoryLoginService } from '../login/in-memory-login-service/in-memory-login-service'
import { createInMemoryAdvertsRepository } from '../adverts/repository/memory'
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
import { createCookieService, createIssuePincode } from '../login'
import { categoryAdapter } from '../categories/category-adapter'
import { createNullEventLogService } from '../events'
import { createNullSubscriptionsRepository } from '../subscriptions'
import { createNullContentRepository } from '../content'

export const TEST_SHARED_SECRET = 'shared scret used in tests'

export const createAuthorizationHeadersFor = (
  user: HaffaUser,
  secret: string = TEST_SHARED_SECRET
): { authorization: string } => ({
  authorization: `Bearer ${jwt.sign(user, secret)}`,
})

const unexpectedInvocation =
  (message: string): (() => Promise<void>) =>
  () =>
    Promise.resolve().then(() =>
      Promise.reject(
        Object.assign(new Error(message), {
          wasUnexpectedNotification: true,
        })
      )
    )

export const createTestNotificationServices = (
  notifications: Partial<NotificationService>
): NotificationService => ({
  subscriptionsHasNewAdverts: unexpectedInvocation(
    'NotificationService::subscriptionsHasNewAdverts'
  ),
  pincodeRequested: unexpectedInvocation(
    'NotificationService::pincodeRequested'
  ),
  advertWasCreated: unexpectedInvocation(
    'NotificationService::advertWasCreated'
  ),
  advertWasRemoved: unexpectedInvocation(
    'NotificationService::advertWasRemoved'
  ),
  advertWasArchived: unexpectedInvocation(
    'NotificationService::advertWasArchived'
  ),
  advertWasUnarchived: unexpectedInvocation(
    'NotificationService::advertWasUnarchived'
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
  advertCollectWasCancelled: unexpectedInvocation(
    'NotificationService::advertCollectWasCancelled'
  ),
  advertNotCollected: unexpectedInvocation(
    'NotificationService::advertNotCollected'
  ),
  ...notifications,
})

export const createTestServices = (services: Partial<Services>): Services => {
  const settings = services.settings || createInMemorySettingsService()
  const userMapper = services.userMapper || createUserMapper(null, settings)
  const categories = services.categories || categoryAdapter(settings)
  const cookies = services.cookies || createCookieService('haffa-token')
  return {
    userMapper,
    categories,
    settings,
    login: createInMemoryLoginService(userMapper, createIssuePincode('123456')),
    tokens: createTokenService(userMapper, { secret: TEST_SHARED_SECRET }),
    cookies,
    adverts: createInMemoryAdvertsRepository(),
    profiles: createInMemoryProfileRepository(),
    files: createNullFileService(),
    notifications: createNullNotificationService(),
    jobs: createJobExecutorServiceFromEnv(),
    eventLog: createNullEventLogService(),
    subscriptions: createNullSubscriptionsRepository(),
    content: createNullContentRepository(),
    ...services,
  }
}

export const createTestApp = (services: Partial<Services>): Application =>
  createApp({
    services: createTestServices(services),
    validateResponse: true,
  })
