import { createAuthorizationServiceFromEnv } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'

const createServicesFromEnv = (): Services => ({
	authorization: createAuthorizationServiceFromEnv(),
	adverts: createAdvertsRepositoryFromEnv(),
})

export { createServicesFromEnv }