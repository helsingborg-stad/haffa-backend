import type { Services } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { createLoginServiceFromEnv } from './login'
import { createFilesServiceFromEnv } from './files'
import { createTokenServiceFromEnv } from './tokens'
import { createProfileRepositoryFromEnv } from './profile'
import { createNotificationServiceFromEnv } from './notifications'
import { createUserMapperFromEnv } from './users'
import { createSettingsServiceFromEnv } from './settings'

const createServicesFromEnv = (): Services => {
  const settings = createSettingsServiceFromEnv()
  const userMapper = createUserMapperFromEnv(settings)
  return {
    userMapper,
    settings,
    login: createLoginServiceFromEnv(userMapper),
    tokens: createTokenServiceFromEnv(userMapper),
    adverts: createAdvertsRepositoryFromEnv(),
    profiles: createProfileRepositoryFromEnv(),
    files: createFilesServiceFromEnv(),
    notifications: createNotificationServiceFromEnv(),
  }
}

export { createServicesFromEnv }
