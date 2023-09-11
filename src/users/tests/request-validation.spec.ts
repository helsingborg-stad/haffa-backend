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
  interface TestCase {
    givenUser: string
    givenLoginPolicies: Partial<LoginPolicy>[]
    expectResponse: Partial<request.Response>
  }
  const TestCases: [string, TestCase][] = [
    [
      'user is allowed when no login policies are set',
      {
        givenUser: 'test@user.com',
        givenLoginPolicies: [] /* no policies what so ever */,
        expectResponse: {
          status: HttpStatusCodes.OK,
          body: { id: 'test@user.com', roles: [] },
        },
      },
    ],
    [
      'user is allowed when matching login policy exists',
      {
        givenUser: 'test@user.com',
        givenLoginPolicies: [
          {
            emailPattern: '.*@user.com',
          },
        ],
        expectResponse: {
          status: HttpStatusCodes.OK,
          body: { id: 'test@user.com', roles: [] },
        },
      },
    ],
    [
      'user is denied when denied by pattern in loginpolicy',
      {
        givenUser: 'test@user.com',
        givenLoginPolicies: [{ emailPattern: '.*@user.com', deny: true }],
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
    [
      'user is denied when explicitly denied by loginpolicy',
      {
        givenUser: 'test@user.com',
        givenLoginPolicies: [{ emailPattern: 'test@user.com', deny: true }],
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
    [
      'user is denied when login policies exists and none matches',
      {
        givenUser: 'test@user.com',
        givenLoginPolicies: [{ emailPattern: 'another@domain.only' }],
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
  ]

  it.each(TestCases)(
    `%s`,
    async (
      description: string,
      { givenUser, givenLoginPolicies, expectResponse }: TestCase
    ) =>
      echoTest(givenUser, givenLoginPolicies, response =>
        expect(response).toMatchObject(expectResponse)
      )
  )

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
})
