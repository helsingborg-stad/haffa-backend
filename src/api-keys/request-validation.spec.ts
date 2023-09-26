import request from 'supertest'
import HttpStatusCodes from 'http-status-codes'
import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import type { ApiKey } from './types'
import { apiKeysAdapter } from './api-keys-adapter'
import type { LoginPolicy } from '../login-policies/types'
import type { Services } from '../types'
import { requireHaffaUser } from '../login/require-haffa-user'
import type { End2EndTestConfig, End2EndTestContext } from '../test-utils'
import { end2endTest } from '../test-utils'

describe('user access validation', () => {
  interface TestCase {
    givenApiKey: string
    givenApiKeys: Partial<ApiKey>[]
    givenLoginPolicies: Partial<LoginPolicy>[]
    expectResponse: Partial<request.Response>
  }
  const TestCases: [string, TestCase][] = [
    [
      'apikey inherits roles from login policy',
      {
        givenApiKey: 'test-api-key',
        givenApiKeys: [{ email: 'test@user.com', secret: 'test-api-key' }],
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
      'apikey is allowed if before expiration',
      {
        givenApiKey: 'test-api-key',
        givenApiKeys: [
          {
            email: 'test@user.com',
            secret: 'test-api-key',
            expires: '2999-12-31',
          },
        ],
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
      'apikey is denied if expired',
      {
        givenApiKey: 'test-api-key',
        givenApiKeys: [
          {
            email: 'test@user.com',
            secret: 'test-api-key',
            expires: '2000-01-01',
          },
        ],
        givenLoginPolicies: [
          {
            emailPattern: '*@user.com',
            roles: ['canReserveAdverts', 'canCollectAdverts'],
          },
        ],
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
    [
      'userId must be allowed by login policies',
      {
        givenApiKey: 'test-api-key',
        givenApiKeys: [{ email: 'test@user.com', secret: 'test-api-key' }],
        givenLoginPolicies: [
          {
            emailPattern: '*@noone.ever',
            roles: [],
          },
        ],
        expectResponse: {
          status: HttpStatusCodes.UNAUTHORIZED,
        },
      },
    ],
    [
      'secret must exist',
      {
        givenApiKey: 'test-api-key',
        givenApiKeys: [],
        givenLoginPolicies: [],
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
        givenApiKey,
        givenApiKeys,
        givenLoginPolicies,
        expectResponse,
      }: TestCase
    ) =>
      echoTest(givenApiKey, givenApiKeys, givenLoginPolicies, response =>
        expect(response).toMatchObject(expectResponse)
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
    apiKey: string,
    server: End2EndTestContext['server']
  ) =>
    request(server)
      .get('/echo-user')
      .set({
        authorization: `api-key ${apiKey}`,
      })

  const echoTest = (
    apiKey: string,
    apiKeys: Partial<ApiKey>[],
    policies: Partial<LoginPolicy>[],
    validate: (response: any) => any
  ) =>
    end2endTest(
      createTestConfig(),
      async ({ server, services: { settings }, loginPolicies }) => {
        await apiKeysAdapter(settings).updateApiKeys(apiKeys)
        await loginPolicies.updateLoginPolicies(policies)
        const result = await makeEchoUserRequest(apiKey, server)
        return validate(result)
      }
    )
})
