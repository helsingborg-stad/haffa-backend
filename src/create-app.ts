import cors from '@koa/cors' 
import bodyparser from 'koa-bodyparser'
import { createApplication } from '@helsingborg-stad/gdi-api-node'
import { healthCheckModule } from '@helsingborg-stad/gdi-api-node'
import { jwtUserModule } from '@helsingborg-stad/gdi-api-node'
import { swaggerModule } from '@helsingborg-stad/gdi-api-node'
import { Application } from '@helsingborg-stad/gdi-api-node'
import { Services } from './types'
import { advertsModule } from './adverts/adverts-module'
import { loginModule } from './login/login-module'

/** Create fully packaged web application, given dependencies */
export const createApp = ({ services, validateResponse }: {services: Services, validateResponse?: boolean}): Application =>
	createApplication({
		openApiDefinitionPath: './openapi.yml',
		validateResponse,
	})
		// .use(webFrameworkModule())
		.use(({ app }) => app.use(cors()))
		.use(({ app }) => app.use(bodyparser({ jsonLimit: '50mb'  })))
		.use(swaggerModule())
		.use(jwtUserModule(services.authorization))
		.use(healthCheckModule())
		.use(advertsModule(services.adverts, services.files))
		.use(loginModule(services.login, services.tokens))
		.use(services.files.tryCreateApplicationModule() || (() => void 0))

