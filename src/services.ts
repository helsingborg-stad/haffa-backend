import type { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { createLoginServiceFromEnv } from './login'
import { createFilesServiceFromEnv } from './files'
import { createTokenServiceFromEnv } from './tokens'
import { createProfileRepositoryFromEnv } from './profile'
import { createNotificationServiceFromEnv } from './notifications'
import { createUserMapperFromEnv } from './users'

const createServicesFromEnv = (): Services => {
	const userMapper = createUserMapperFromEnv()
	return {
		userMapper,
		login: createLoginServiceFromEnv(userMapper),
		tokens: createTokenServiceFromEnv(userMapper),
		adverts: createAdvertsRepositoryFromEnv(),
		profiles: createProfileRepositoryFromEnv(),
		files: createFilesServiceFromEnv(),
		notifications: createNotificationServiceFromEnv(),
	}
}

export { createServicesFromEnv }