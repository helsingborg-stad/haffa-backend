import request from 'supertest'
import HttpStatusCodes from 'http-status-codes'
import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import type { End2EndTestConfig, End2EndTestContext } from '../../test-utils'
import { end2endTest } from '../../test-utils'
import { requireHaffaUser } from '../../login/require-haffa-user'
import type { Services } from '../../types'
import type { TokenService } from '../../tokens/types'
import type { HaffaUser } from '../../login/types'
import { makeUser } from '../../login'
import type { LoginPolicy } from '../../login-policies/types'

describe('user access validation', () => {
  const createUserEchoModule =
    (services: Services): ApplicationModule =>
    ({ router }) =>
      router.get(
        '/echo-user',
        requireHaffaUser(services.userMapper, ctx => {
          ctx.body = ctx.user || {}
        })
      )

  const createTestConfig = (): End2EndTestConfig => ({
    setupApplication: (app, services) =>
      app.use(createUserEchoModule(services)),
  })

  const makeEchoUserRequest = (
    user: HaffaUser,
    server: End2EndTestContext['server'],
    tokens: TokenService
  ) =>
    request(server)
      .get('/echo-user')
      .set({
        authorization: `Bearer ${tokens.sign(user)}`,
      })

  const echoTest = (
    userEmail: string,
    policies: Partial<LoginPolicy>[],
    validate: (response: any) => any
  ) =>
    end2endTest(
      createTestConfig(),
      async ({ server, services: { tokens }, loginPolicies }) => {
        await loginPolicies.updateLoginPolicies(policies)
        const result = await makeEchoUserRequest(
          makeUser({ id: userEmail }),
          server,
          tokens
        )
        return validate(result)
      }
    )

  it('access is allowed when there are no loginPolicies', () =>
    echoTest('test@user.com', [], response =>
      expect(response).toMatchObject({
        status: HttpStatusCodes.OK,
        body: {
          id: 'test@user.com',
          roles: [],
        },
      })
    ))

  it('access is denied when not explicitly described in loginPolicy', () =>
    echoTest(
      'test@user.com',
      [
        {
          emailPattern: 'some@random.domain',
        },
      ],
      response =>
        expect(response).toMatchObject({
          status: HttpStatusCodes.UNAUTHORIZED,
        })
    ))

  it('access is allowed when added to loginPolicy', () =>
    echoTest(
      'test@user.com',
      [
        {
          emailPattern: 'test@user.com',
        },
      ],
      response =>
        expect(response).toMatchObject({
          status: HttpStatusCodes.OK,
          body: {
            id: 'test@user.com',
          },
        })
    ))

  it('access is denied when denied in loginPolicy', () =>
    echoTest(
      'test@user.com',
      [
        {
          emailPattern: 'test@user.com',
          deny: true,
        },
      ],
      response =>
        expect(response).toMatchObject({
          status: HttpStatusCodes.UNAUTHORIZED,
        })
    ))

  it('validates per request', () =>
    end2endTest(
      createTestConfig(),
      async ({ server, services: { tokens }, loginPolicies }) => {
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: 'test@user.com',
            roles: ['a', 'b', 'c'],
          },
        ])
        expect(
          await makeEchoUserRequest(
            makeUser({ id: 'test@user.com' }),
            server,
            tokens
          )
        ).toMatchObject({
          status: HttpStatusCodes.OK,
          body: {
            id: 'test@user.com',
            roles: ['a', 'b', 'c'],
          },
        })

        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: 'test@user.com',
            deny: true,
          },
        ])
        expect(
          await makeEchoUserRequest(
            makeUser({ id: 'test@user.com' }),
            server,
            tokens
          )
        ).toMatchObject({
          status: HttpStatusCodes.UNAUTHORIZED,
        })

        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: 'test@user.com',
            roles: [],
          },
        ])
        expect(
          await makeEchoUserRequest(
            makeUser({ id: 'test@user.com' }),
            server,
            tokens
          )
        ).toMatchObject({
          status: HttpStatusCodes.OK,
          body: {
            id: 'test@user.com',
            roles: [],
          },
        })
      }
    ))
})
