import { createAuthorizationServiceFromEnv } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { Services } from './types'


const createServicesFromEnv = (): Services => ({
	authorization: createAuthorizationServiceFromEnv(),
})

export { createServicesFromEnv }