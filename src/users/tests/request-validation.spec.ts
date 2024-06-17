import request from 'supertest'
import HttpStatusCodes from 'http-status-codes'
import type { End2EndTestConfig, End2EndTestContext } from '../../test-utils'
import { end2endTest } from '../../test-utils'
import { requireHaffaUser } from '../../login/require-haffa-user'
import type { Services } from '../../types'
import type { TokenService } from '../../tokens/types'
import type { HaffaUser } from '../../login/types'
import { makeRoles, makeUser } from '../../login'
import type { LoginPolicy } from '../../login-policies/types'
import type { UserMapperConfig } from '../types'
import { userMapperConfigAdapter } from '..'
import type { ApplicationModule } from '../../lib/gdi-api-node'

describe('user access validation', () => {
  interface TestCase {
    givenUser: string
    givenLoginPolicies?: Partial<LoginPolicy>[]
    givenUserMapperConfig?: Partial<UserMapperConfig>
    expectResponse: Partial<request.Response>
  }
  const TestCases: [string, TestCase][] = [
    [
      'phone users is disallowed by default',
      {
        givenUser: '072 1234567',
        givenLoginPolicies: [],
        givenUserMapperConfig: {},
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
    [
      'phone users can be disallowed by cinfiguration',
      {
        givenUser: '072 1234567',
        givenLoginPolicies: [],
        givenUserMapperConfig: {
          phone: {
            allowPhoneUsers: false,
            country: 'SE',
            roles: [],
            sender: 'Haffa',
          },
        },
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
    [
      'phone users is allowed when configured for',
      {
        givenUser: '072 1234567',
        givenLoginPolicies: [],
        givenUserMapperConfig: {
          phone: {
            allowPhoneUsers: true,
            country: 'SE',
            roles: [],
            sender: 'Haffa',
          },
        },
        expectResponse: {
          status: HttpStatusCodes.OK,
          body: { id: '+46721234567', roles: {} },
        },
      },
    ],
    [
      'prefixed phone users is allowed when configured for',
      {
        givenUser: '+46 72 12 34 567',
        givenLoginPolicies: [],
        givenUserMapperConfig: {
          phone: {
            allowPhoneUsers: true,
            country: 'SE',
            roles: [],
            sender: 'Haffa',
          },
        },
        expectResponse: {
          status: HttpStatusCodes.OK,
          body: { id: '+46721234567', roles: {} },
        },
      },
    ],
    [
      'user is allowed when no login policies are set',
      {
        givenUser: 'test@user.com',
        givenLoginPolicies: [] /* no policies what so ever */,
        expectResponse: {
          status: HttpStatusCodes.OK,
          body: { id: 'test@user.com', roles: {} },
        },
      },
    ],
    [
      'user is allowed when matching login policy exists',
      {
        givenUser: 'test@user.com',
        givenLoginPolicies: [
          {
            emailPattern: '*@user.com',
            roles: ['canReserveAdverts', 'canCollectAdverts'],
          },
        ],
        expectResponse: {
          status: HttpStatusCodes.OK,
          body: {
            id: 'test@user.com',
            roles: {
              ...makeRoles(false),
              canReserveAdverts: true,
              canCollectAdverts: true,
            },
          },
        },
      },
    ],
    [
      'user is denied when denied by pattern in login policy',
      {
        givenUser: 'test@user.com',
        givenLoginPolicies: [{ emailPattern: '*@user.com', deny: true }],
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
    [
      'user is denied when explicitly denied by login policy',
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
      {
        givenUser,
        givenLoginPolicies,
        givenUserMapperConfig,
        expectResponse,
      }: TestCase
    ) =>
      echoTest(
        givenUser,
        givenLoginPolicies || [],
        givenUserMapperConfig || {},
        response => expect(response).toMatchObject(expectResponse)
      )
  )

  it('validates per request', () =>
    end2endTest(
      createTestConfig(),
      async ({ server, services: { tokens }, loginPolicies }) => {
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: 'test@user.com',
            roles: ['canEditOwnAdverts'],
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
            roles: { canEditOwnAdverts: true },
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
            roles: {},
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
    config: Partial<UserMapperConfig>,
    validate: (response: any) => any
  ) =>
    end2endTest(
      createTestConfig(),
      async ({ server, services: { tokens, settings }, loginPolicies }) => {
        await userMapperConfigAdapter(settings).updateUserMapperConfig(config)
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
