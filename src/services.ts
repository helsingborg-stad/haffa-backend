import { AuthorizationService, createAuthorizationServiceFromEnv } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { getEnv } from '@helsingborg-stad/gdi-api-node'

const tryCreateFakeAuthorizationFromEnv = (): AuthorizationService | null => {
	const user = getEnv('FAKE_AUTHORIZATION_USER', { fallback: '' })
	return user ? ({
		tryGetUserFromJwt: () => JSON.parse(user),
	}) : null
}

const createServicesFromEnv = (): Services => ({
	authorization: tryCreateFakeAuthorizationFromEnv() || createAuthorizationServiceFromEnv(),
	adverts: createAdvertsRepositoryFromEnv(),
})

export { createServicesFromEnv }