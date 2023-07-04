import { createApp } from './create-app'
import { createServicesFromEnv } from './services'
import type { Services } from './types'

const services: Services = createServicesFromEnv()

/** Main entry point that start and runs web server */
void createApp({
  services,
  validateResponse: false,
}).start(process.env.PORT || 4000)
