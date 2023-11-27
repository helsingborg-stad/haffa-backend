import request from 'supertest'
import HttpStatusCodes from 'http-status-codes'
import { end2endTest } from '../../test-utils'
import { userMapperConfigAdapter } from '../../users'
import { loginPolicyAdapter } from '../../login-policies/login-policy-adapter'
import { makeUser } from '..'
import { createTokenService } from '../../tokens'

describe('verify-token', () => {
  it('verify-token denies by default', () =>
    end2endTest({}, async ({ server }) => {
      const { status, body } = await request(server).post(
        '/api/v1/haffa/auth/verify-token'
      )
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject({
        guest: false,
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
        guest: false,
        token: '',
        roles: [],
      })
    }))

  it('verify-token denies foreign tokens', () =>
    end2endTest({}, async ({ server, services: { userMapper } }) => {
      const foreignToken = createTokenService(userMapper, {
        secret: 'wrong secret',
      }).sign(makeUser({ id: 'test@user.com' }))
      const { status, body } = await request(server)
        .post('/api/v1/haffa/auth/verify-token')
        .send({
          token: foreignToken,
        })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject({
        guest: false,
        token: '',
        roles: [],
      })
    }))

  it('verify-token allows guest access if configured', () =>
    end2endTest(
      {},
      async ({ server, services: { settings, userMapper, tokens } }) => {
        await userMapperConfigAdapter(settings).updateUserMapperConfig({
          allowGuestUsers: true,
        })

        const guestToken = await userMapper.tryCreateGuestToken(tokens)

        const { status, body } = await request(server).post(
          '/api/v1/haffa/auth/verify-token'
        )
        expect(status).toBe(HttpStatusCodes.OK)
        expect(body).toMatchObject({
          guest: true,
          token: guestToken,
          roles: [],
        })
      }
    ))

  it('verify-token accepts valid token', () =>
    end2endTest({}, async ({ server, services: { settings, tokens } }) => {
      await loginPolicyAdapter(settings).updateLoginPolicies([
        {
          emailPattern: 'test@user.com',
          roles: ['canEditTerms'],
        },
      ])
      const token = tokens.sign(makeUser({ id: 'test@user.com' }))

      const { status, body } = await request(server)
        .post('/api/v1/haffa/auth/verify-token')
        .send({
          token,
        })
      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject({
        guest: false,
        token,
        roles: ['canEditTerms'],
      })
    }))

  it('verify-token denies guest after reconfiguration', () =>
    end2endTest(
      {},
      async ({ server, services: { settings, userMapper, tokens } }) => {
        // turn on guest access
        await userMapperConfigAdapter(settings).updateUserMapperConfig({
          allowGuestUsers: true,
        })
        // get valid guest token
        const guestToken = await userMapper.tryCreateGuestToken(tokens)
        // turn off guest access
        await userMapperConfigAdapter(settings).updateUserMapperConfig({
          allowGuestUsers: false,
        })

        const { status, body } = await request(server)
          .post('/api/v1/haffa/auth/verify-token')
          .send({ token: guestToken })

        expect(status).toBe(HttpStatusCodes.OK)
        expect(body).toMatchObject({
          guest: false,
          token: '',
          roles: [],
        })
      }
    ))

  it('verify-token denies user after reconfiguration', () =>
    end2endTest({}, async ({ server, services: { tokens, settings } }) => {
      await loginPolicyAdapter(settings).updateLoginPolicies([
        {
          emailPattern: 'test@user.com',
          roles: [],
          deny: true,
        },
      ])

      // get test user token
      // note that test user is not a described valid login
      const token = tokens.sign(makeUser({ id: 'test@user.com' }))
      expect(token).toBeTruthy()

      const { status, body } = await request(server)
        .post('/api/v1/haffa/auth/verify-token')
        .send({ token })

      expect(status).toBe(HttpStatusCodes.OK)
      expect(body).toMatchObject({
        guest: false,
        token: '',
        roles: [],
      })
    }))
})
