import { createAuthorizationServiceFromEnv } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { createAccessServiceFromEnv } from './access/index'
import { createLoginServicerFromEnv } from './login'

const createServicesFromEnv = (): Services => ({
	authorization: createAuthorizationServiceFromEnv(),
	login: createLoginServicerFromEnv(),
	adverts: createAdvertsRepositoryFromEnv(),
	access: createAccessServiceFromEnv(),
})

export { createServicesFromEnv }