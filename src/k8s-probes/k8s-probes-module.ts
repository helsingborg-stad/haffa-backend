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
      await Promise.all([adverts.checkHealth(), login.checkHealth()])
      ctx.status = 200
      ctx.body = 'OK'
    }
    router.get('/healthz', check)
    router.get('/readyz', check)
    router.get('/livez', check)
  }
