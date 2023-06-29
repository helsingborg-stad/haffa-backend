import { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { createAccessServiceFromEnv } from './access/index'
import { createLoginServiceFromEnv } from './login'
import { createFilesServiceFromEnv } from './files'
import { createTokenServiceFromEnv } from './tokens'
import { createProfileRepositoryFromEnv } from './profile'

const createServicesFromEnv = (): Services => ({
	login: createLoginServiceFromEnv(),
	tokens: createTokenServiceFromEnv(),
	adverts: createAdvertsRepositoryFromEnv(),
	profiles: createProfileRepositoryFromEnv(),
	access: createAccessServiceFromEnv(),
	files: createFilesServiceFromEnv(),
})

export { createServicesFromEnv }