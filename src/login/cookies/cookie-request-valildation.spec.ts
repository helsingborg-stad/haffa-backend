import request from 'supertest'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../../types'
import { requireHaffaUser } from '../require-haffa-user'
import {
  end2endTest,
  type End2EndTestConfig,
  type End2EndTestContext,
} from '../../test-utils'
import type { LoginPolicy } from '../../login-policies/types'
import type { ApplicationModule } from '../../lib/gdi-api-node'

describe('user access validation', () => {
  interface TestCase {
    givenCookieUser: string | null
    givenLoginPolicies: Partial<LoginPolicy>[]
    expectResponse: Partial<request.Response>
  }
  const TestCases: [string, TestCase][] = [
    [
      'accepts token in cookie',
      {
        givenCookieUser: 'test@user.com',
        givenLoginPolicies: [
          {
            emailPattern: '*@user.com',
            roles: ['canReserveAdverts', 'canCollectAdverts'],
          },
        ],
        expectResponse: {
          status: HttpStatusCodes.OK,
          body: { id: 'test@user.com', roles: {} },
        },
      },
    ],
    [
      'token in cookie can be denied by login policies',
      {
        givenCookieUser: 'test@user.com',
        givenLoginPolicies: [
          {
            emailPattern: '*@user.com',
            roles: [],
            deny: true,
          },
        ],
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
    [
      'token in cookie must match login policies',
      {
        givenCookieUser: 'test@unknown-user.com',
        givenLoginPolicies: [
          {
            emailPattern: '*@user.com',
            roles: [],
            deny: true,
          },
        ],
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
      { givenCookieUser, givenLoginPolicies, expectResponse }: TestCase
    ) =>
      end2endTest(
        createTestConfig(),
        async ({ server, services: { tokens }, loginPolicies }) => {
          await loginPolicies.updateLoginPolicies(givenLoginPolicies)

          const token = givenCookieUser
            ? tokens.sign({ id: givenCookieUser })
            : ''

          const response = await makeEchoUserRequest(token, server)
          expect(response).toMatchObject(expectResponse)
        }
      )
  )

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
    cookie: string,
    server: End2EndTestContext['server']
  ) =>
    request(server)
      .get('/echo-user')
      .set({
        cookie: `haffa-token=${cookie}`,
      })
})
