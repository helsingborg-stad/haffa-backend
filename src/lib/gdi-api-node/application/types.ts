import type { Handler } from 'openapi-backend'
import type OpenAPIBackend from 'openapi-backend'
import type Koa from 'koa'
import type Router from 'koa-router'
import type { Server } from 'node:http'

// TODO: Document this
export interface ApplicationContext {
  app: Koa
  api: OpenAPIBackend
  router: Router
  application: Application
  extend: (extension: Partial<ApplicationExtension>) => void
  registerKoaApi: (handlers: Record<string, Koa.Middleware>) => void
}

export type ApplicationModule = (
  context: ApplicationContext
) => any | Promise<any>

export type ApplicationRunHandler = (server: Server) => Promise<any>

export interface ApplicationExtension {
  compose: (m: Koa.Middleware) => Koa.Middleware
  mapApi: (api: Record<string, Handler>) => Promise<Record<string, Handler>>
}

export interface Application {
  getContext(): ApplicationContext
  use(module: ApplicationModule): Application
  start(port: number | string): Promise<Server>
  run(handler: ApplicationRunHandler, port?: number): Promise<void>
}
