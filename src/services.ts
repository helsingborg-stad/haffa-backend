import { createAdvertsRepositoryFromEnv } from './adverts'
import { createGetAdvertMeta } from './adverts/advert-meta'
import { categoryAdapter } from './categories/category-adapter'
import { createContentRepositoryFromEnv } from './content'
import { createEventLogServiceFromEnv } from './events'
import { createFilesServiceFromEnv } from './files'
import { createJobExecutorServiceFromEnv } from './jobs'
import { obfuscate } from './lib'
import { createCookieServiceFromEnv, createLoginServiceFromEnv } from './login'
import { createNotificationServiceFromEnv } from './notifications'
import { createProfileRepositoryFromEnv } from './profile'
import { createSettingsServiceFromEnv } from './settings'
import { createSubscriptionsRepositoryFromEnv } from './subscriptions'
import { createSyslogServiceFromEnv } from './syslog'
import { createTokenServiceFromEnv } from './tokens'
import type { Services, StartupLog } from './types'
import { createUserMapperFromEnv } from './users'
import { createWorkflowServiceFromEnv } from './workflow'

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
  const getAdvertMeta = createGetAdvertMeta()
  const workflow = createWorkflowServiceFromEnv()
  const startupLog = createStartupLog()
  const settings = createSettingsServiceFromEnv(startupLog)
  const userMapper = createUserMapperFromEnv(startupLog, settings)
  const eventLog = createEventLogServiceFromEnv(startupLog)
  const categories = categoryAdapter(settings)
  const adverts = createAdvertsRepositoryFromEnv(
    startupLog,
    getAdvertMeta,
    settings
  )
  const files = createFilesServiceFromEnv(startupLog)
  const profiles = createProfileRepositoryFromEnv(startupLog)
  const syslog = createSyslogServiceFromEnv(startupLog)
  const notifications = createNotificationServiceFromEnv(startupLog, {
    categories,
    profiles,
    eventLog,
    settings,
  })
  const subscriptions = createSubscriptionsRepositoryFromEnv(startupLog, {
    adverts,
    notifications,
    userMapper,
  })
  return {
    getAdvertMeta,
    workflow,
    userMapper,
    categories,
    settings,
    files,
    login: createLoginServiceFromEnv(startupLog, userMapper),
    tokens: createTokenServiceFromEnv(startupLog, userMapper),
    cookies: createCookieServiceFromEnv(startupLog),
    adverts,
    profiles,
    notifications,
    jobs: createJobExecutorServiceFromEnv({
      getAdvertMeta,
      workflow,
      syslog,
      notifications,
      adverts,
      files,
      subscriptions,
    }),
    eventLog,
    subscriptions,
    content: createContentRepositoryFromEnv(startupLog, {
      files,
    }),
    syslog,
  }
}

export { createServicesFromEnv }
