import type { Services, StartupLog } from './types'
import { createAdvertsRepositoryFromEnv } from './adverts'
import { createLoginServiceFromEnv } from './login'
import { createFilesServiceFromEnv } from './files'
import { createTokenServiceFromEnv } from './tokens'
import { createProfileRepositoryFromEnv } from './profile'
import { createNotificationServiceFromEnv } from './notifications'
import { createUserMapperFromEnv } from './users'
import { createSettingsServiceFromEnv } from './settings'
import { createJobExecutorServiceFromEnv } from './jobs'
import { obfuscate } from './lib'
import { categoryAdapter } from './categories/category-adapter'

const createStartupLog = (): StartupLog => ({
  echo: (service, { name, config }) => {
    // eslint-disable-next-line no-console
    console.log(
      config
        ? `[startup] ${name} ${JSON.stringify(obfuscate(config))}`
        : `[startup] ${name}`
    )
    return service
  },
})

const createServicesFromEnv = (): Services => {
  const startupLog = createStartupLog()
  const settings = createSettingsServiceFromEnv(startupLog)
  const userMapper = createUserMapperFromEnv(startupLog, settings)
  const categories = categoryAdapter(settings)
  return {
    userMapper,
    categories,
    settings,
    login: createLoginServiceFromEnv(startupLog, userMapper),
    tokens: createTokenServiceFromEnv(startupLog, userMapper),
    adverts: createAdvertsRepositoryFromEnv(startupLog),
    profiles: createProfileRepositoryFromEnv(startupLog),
    files: createFilesServiceFromEnv(startupLog),
    notifications: createNotificationServiceFromEnv(startupLog, categories),
    jobs: createJobExecutorServiceFromEnv(),
  }
}

export { createServicesFromEnv }
