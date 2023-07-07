import { createApp } from './create-app'
import { createServicesFromEnv } from './services'
import type { Services } from './types'

const services: Services = createServicesFromEnv()
const port = process.env.PORT || 4000
/** Main entry point that start and runs web server */
void createApp({
  services,
  validateResponse: false,
})
.start(process.env.PORT || 4000)
.then(() => console.log(`Haffa backend running on port ${port}`))
