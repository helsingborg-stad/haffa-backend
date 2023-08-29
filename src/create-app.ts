import cors from '@koa/cors'
import bodyparser from 'koa-bodyparser'
import type { Application } from '@helsingborg-stad/gdi-api-node'
import {
  createApplication,
  healthCheckModule,
  jwtUserModule,
  swaggerModule,
} from '@helsingborg-stad/gdi-api-node'
import type { Services } from './types'
import { graphQLModule } from './haffa/haffa-module'
import { loginModule } from './login/login-module'
import { gitRevisionModule } from './git-revision-module'

/** Create fully packaged web application, given dependencies */
export const createApp = ({
  services,
  validateResponse,
}: {
  services: Services
  validateResponse?: boolean
}): Application =>
  createApplication({
    openApiDefinitionPath: './openapi.yml',
    validateResponse,
  })
    // .use(webFrameworkModule())
    .use(gitRevisionModule())
    .use(({ app }) => app.use(cors()))
    .use(({ app }) => app.use(bodyparser({ jsonLimit: '50mb' })))
    .use(swaggerModule({routePrefix: '/api/v1/haffa/swagger'}))
    .use(jwtUserModule(services.tokens))
    .use(healthCheckModule())
    .use(graphQLModule(services))
    .use(loginModule(services.login, services.tokens, services.notifications))
    .use(services.files.tryCreateApplicationModule() || (() => 0))
