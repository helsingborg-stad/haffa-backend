import * as path from 'path'
import type * as Koa from 'koa'
import { createApplication } from '../application'
import { swaggerModule } from '../modules/swagger'
import { webFrameworkModule } from '../modules/web-framework'
import type {
  Application,
  ApplicationContext,
  ApplicationModule,
} from '../application/types'

const noop = () => undefined

/** register a handler for (Koa captured) errors to prevenmt default console.error logging  */
const silentErrorsModule =
  (): ApplicationModule =>
  ({ app }) =>
    app.on('error', noop)

export const getOpenApiDefinitionPathForTest = () =>
  path.join(__dirname, './test-app.openapi.yml')

/** create full baked application  configured for test */
const createTestApp = (): Application =>
  createApplication({
    openApiDefinitionPath: getOpenApiDefinitionPathForTest(),
    validateResponse: true,
  })
    .use(silentErrorsModule())
    .use(webFrameworkModule())
    .use(swaggerModule())

/** Shorthand module for registering API operations in application */
const registerTestApi =
  (handlers: Record<string, Koa.Middleware>): ApplicationModule =>
  ({ registerKoaApi }: ApplicationContext) =>
    registerKoaApi(handlers)

export { createTestApp, registerTestApi }
