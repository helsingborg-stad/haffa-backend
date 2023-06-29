import { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { createAccessServiceFromEnv } from './access/index'
import { createLoginServiceFromEnv } from './login'
import { createFilesServiceFromEnv } from './files'
import { createTokenServiceFromEnv } from './tokens'

const createServicesFromEnv = (): Services => ({
	login: createLoginServiceFromEnv(),
	tokens: createTokenServiceFromEnv(),
	adverts: createAdvertsRepositoryFromEnv(),
	access: createAccessServiceFromEnv(),
	files: createFilesServiceFromEnv(),
})

export { createServicesFromEnv }