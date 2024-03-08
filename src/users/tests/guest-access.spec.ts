import request from 'supertest'
import HttpStatusCodes from 'http-status-codes'
import type { End2EndTestConfig } from '../../test-utils'
import { end2endTest } from '../../test-utils'
import { requireHaffaUser } from '../../login/require-haffa-user'
import { userMapperConfigAdapter } from '..'
import { GUEST_USER_ID } from '../../login'

describe('guest access', () => {
  // e2e test configuration with a guarded endpoint /echo-user
  const createTestConfig = (): End2EndTestConfig => ({
    setupApplication: (app, services) =>
      app.use(({ router }) =>
        router.get(
          '/echo-user',
          requireHaffaUser(services.userMapper, ctx => {
            ctx.body = ctx.user || {}
          })
        )
      ),
  })

  it('is enabled if set in user mapper settings', () =>
    end2endTest(
      createTestConfig(),
      async ({ server, services: { settings } }) => {
        await userMapperConfigAdapter(settings).updateUserMapperConfig({
          allowGuestUsers: true,
        })
        const {
          status,
          body: { id },
        } = await request(server).get('/echo-user')
        expect(status).toBe(HttpStatusCodes.OK)
        expect(id).toBe(GUEST_USER_ID)
      }
    ))

  it('can be disabled', () =>
    end2endTest(
      createTestConfig(),
      async ({ server, services: { settings } }) => {
        await userMapperConfigAdapter(settings).updateUserMapperConfig({
          allowGuestUsers: false,
        })
        const { status } = await request(server).get('/echo-user')
        expect(status).toBe(HttpStatusCodes.UNAUTHORIZED)
      }
    ))

  it('verify-token denies by default', () =>
    end2endTest(createTestConfig(), async ({ server }) => {
      const { status, body } = await request(server).post(
        '/api/v1/haffa/auth/verify-token'
      )
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject({
        token: '',
        roles: [],
      })
    }))
})
