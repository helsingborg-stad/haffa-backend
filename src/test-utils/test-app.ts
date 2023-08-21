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
import { createInMemoryUserMapper } from '../users'


export const TEST_SHARED_SECRET = 'shared scret used in tests'

export const createAuthorizationHeadersFor = (user: HaffaUser, secret: string = TEST_SHARED_SECRET): {authorization: string} => ({
	authorization: `Bearer ${jwt.sign(user, secret)}`,
})

const unexpectedInvocation = (message: string) => () => { throw new Error(message) }

export const createTestNotificationServices = (notifications: Partial<NotificationService>): NotificationService => ({
	pincodeRequested: unexpectedInvocation('NotificationService::pincodeRequested'),
	advertWasReserved: unexpectedInvocation('NotificationService::advertWasReserved'),
	advertReservationWasCancelled: unexpectedInvocation('NotificationService::advertReservationWasCancelled'),
	advertWasCollected: unexpectedInvocation('NotificationService::advertWasCollected'),
	...notifications,
})

export const createTestServices = (services: Partial<Services>): Services => {
	const userMapper = services.userMapper || createInMemoryUserMapper('')
	return {
		userMapper,
		login: createInMemoryLoginService(userMapper),
		tokens: createTokenService(userMapper, TEST_SHARED_SECRET),
		adverts: createInMemoryAdvertsRepository(),
		profiles: createInMemoryProfileRepository(),
		files: createNullFileService(),
		notifications: createNullNotificationService(),
		...services,
	}
}

export const createTestApp = (services: Partial<Services>): Application => createApp({
	services: createTestServices(services),
	validateResponse: true,
})
