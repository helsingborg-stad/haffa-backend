import { createApp } from './create-app'
import { createServicesFromEnv } from './services'
import { Services } from './types'

const services: Services = createServicesFromEnv()

/** Main entry point that start and runs web server */
createApp({
	services,
	validateResponse: false,
})
	.start(process.env.PORT || 3000)
