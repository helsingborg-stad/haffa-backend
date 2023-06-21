import { createAuthorizationServiceFromEnv } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { createAccessServiceFromEnv } from './access/index'

const createServicesFromEnv = (): Services => ({
	authorization: createAuthorizationServiceFromEnv(),
	adverts: createAdvertsRepositoryFromEnv(),
	access: createAccessServiceFromEnv(),
})

export { createServicesFromEnv }