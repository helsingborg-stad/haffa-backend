import request from 'supertest'
import HttpStatusCodes from 'http-status-codes'
import { end2endTest } from '../../test-utils'
import { userMapperConfigAdapter } from '../../users'

describe('verify-token', () => {
  it('verify-token denies by default', () =>
    end2endTest({}, async ({ server }) => {
      const { status, body } = await request(server).post(
        '/api/v1/haffa/auth/verify-token'
      )
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject({
        token: '',
        roles: [],
      })
    }))

  it('verify-token denies bad tokens', () =>
    end2endTest({}, async ({ server }) => {
      const { status, body } = await request(server)
        .post('/api/v1/haffa/auth/verify-token')
        .send({
          token: 'bad token',
        })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject({
        token: '',
        roles: [],
      })
    }))

  it('verify-token allows guest access', () =>
    end2endTest({}, async ({ server, services: { settings, tokens } }) => {
      await userMapperConfigAdapter(settings).updateUserMapperConfig({
        allowGuestUsers: true,
      })

      const {
        status,
        body: { token, roles },
      } = await request(server).post('/api/v1/haffa/auth/verify-token')
      const user = await tokens.decode(token)
      expect(status).toBe(HttpStatusCodes.OK)
      expect(roles).toMatchObject([])
      expect(user).toMatchObject({ id: 'guest' })
    }))
})
