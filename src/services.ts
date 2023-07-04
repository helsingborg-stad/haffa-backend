import type { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { createLoginServiceFromEnv } from './login'
import { createFilesServiceFromEnv } from './files'
import { createTokenServiceFromEnv } from './tokens'
import { createProfileRepositoryFromEnv } from './profile'
import { createNotificationServiceFromEnv } from './notifications'

const createServicesFromEnv = (): Services => ({
	login: createLoginServiceFromEnv(),
	tokens: createTokenServiceFromEnv(),
	adverts: createAdvertsRepositoryFromEnv(),
	profiles: createProfileRepositoryFromEnv(),
	files: createFilesServiceFromEnv(),
	notifications: createNotificationServiceFromEnv(),
})

export { createServicesFromEnv }