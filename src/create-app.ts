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
import { apiKeyUserModule } from './api-keys'
import { cookieUserModule } from './login/cookies/cookie-user-module'
import { optionsUserModule } from './options/options-user-module'
import { guestUserModule } from './guest'

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
    .use(swaggerModule({ routePrefix: '/api/v1/haffa/swagger' }))
    .use(optionsUserModule(services.settings))
    .use(apiKeyUserModule(services.settings))
    .use(jwtUserModule(services.tokens))
    .use(guestUserModule(services.userMapper))
    .use(cookieUserModule(services.cookies, services.tokens))
    .use(healthCheckModule())
    /* .use(({ app }) =>
      app.use((ctx, next) => {
        console.log({ id: ctx?.user?.id, path: ctx.request.path })
        return next()
      })
    ) */
    .use(graphQLModule(services))
    .use(
      loginModule(
        services.login,
        services.tokens,
        services.userMapper,
        services.cookies,
        services.notifications
      )
    )
    .use(services.files.tryCreateApplicationModule() || (() => 0))
