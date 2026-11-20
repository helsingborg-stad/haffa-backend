import type { ApplicationModule } from '../lib/gdi-api-node'
import type { Services } from '../types'

export const k8sProbesModule =
  ({
    adverts,
    login,
  }: Pick<Services, 'adverts' | 'login'>): ApplicationModule =>
  ({ router }) => {
    router.get('/healthz', async ctx => {
      await Promise.all([adverts.checkHealth(), login.checkHealth()])
      ctx.status = 200
      ctx.body = 'OK'
    })
    router.get('/readyz', ctx => {
      ctx.status = 200
      ctx.body = 'OK'
    })
    router.get('/livez', ctx => {
      ctx.status = 200
      ctx.body = 'OK'
    })
  }
