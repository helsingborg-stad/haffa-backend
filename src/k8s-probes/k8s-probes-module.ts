import type Router from 'koa-router'
import type { ApplicationModule } from '../lib/gdi-api-node'
import type { Services } from '../types'

export const k8sProbesModule =
  ({
    adverts,
    login,
  }: Pick<Services, 'adverts' | 'login'>): ApplicationModule =>
  ({ router }) => {
    const check: Router.IMiddleware = async ctx => {
      const healthResults = await Promise.all([
        adverts.checkHealth(),
        login.checkHealth(),
      ]).catch(() => [false])
      ctx.status = healthResults.every(check => check) ? 200 : 503
      ctx.body = ctx.status === 200 ? 'OK' : 'Service Unavailable'
    }
    router.get('/healthz', check)
    router.get('/readyz', check)
    router.get('/livez', ctx => {
      ctx.status = 200
      ctx.body = 'OK'
    })
  }
