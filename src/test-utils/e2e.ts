import type { Test } from 'supertest'
import request from 'supertest'
import HttpStatusCodes from 'http-status-codes'
import type { ApplicationRunHandler } from '@helsingborg-stad/gdi-api-node/application'
import type { Services } from '../types'
import type { Advert } from '../adverts/types'
import type { LoginRequestEntry } from '../login/in-memory-login-service/in-memory-login-service'
import { createInMemoryLoginService } from '../login/in-memory-login-service/in-memory-login-service'
import { createTestApp, createTestServices } from './test-app'
import { createInMemoryAdvertsRepository } from '../adverts/in-memory-adverts-repository'
import type { TokenService } from '../tokens/types'
import { createInMemoryProfileRepository } from '../profile'
import type { Profile } from '../profile/types'
import type { HaffaUser } from '../login/types'
import { type UserMapper } from '../users/types'
import type { SettingsService } from '../settings/types'
import { createUserMapper } from '../users'
import { createInMemorySettingsService } from '../settings'
import { loginPolicyAdapter } from '../login-policies/login-policy-adapter'

const createGqlRequest =
  (
    tokens: TokenService,
    server: Parameters<ApplicationRunHandler>[0],
    user: HaffaUser
  ) =>
  (query: string, variables: any): Test =>
    request(server)
      .post('/api/v1/haffa/graphql')
      .set({
        authorization: `Bearer ${tokens.sign(user)}`,
      })
      .send({ query, variables })

const createMappedGqlRequest =
  (
    tokens: TokenService,
    server: Parameters<ApplicationRunHandler>[0],
    user: HaffaUser
  ) =>
  <T>(name: string, query: string, variables: any): Promise<T> =>
    createGqlRequest(
      tokens,
      server,
      user
    )(query, variables)
      .expect(HttpStatusCodes.OK)
      .then(({ body }) => body.data[name] as T)

export interface End2EndTestContext {
  user: HaffaUser
  gqlRequest: ReturnType<typeof createGqlRequest>
  mappedGqlRequest: ReturnType<typeof createMappedGqlRequest>
  server: Parameters<ApplicationRunHandler>[0]
  services: Services
  adverts: Record<string, Advert>
  profiles: Record<string, Profile>
  logins: Record<string, LoginRequestEntry>
  loginPolicies: ReturnType<typeof loginPolicyAdapter>
}

export interface End2EndTestHandler {
  (context: End2EndTestContext): Promise<void>
}
export const end2endTest = (
  config: {
    user?: HaffaUser
    services: Partial<Services>
  } | null,
  handler: End2EndTestHandler
): Promise<void> => {
  const user: HaffaUser = config?.user || { id: 'test@user.com', roles: [] }
  const adverts: Record<string, Advert> = {}
  const logins: Record<string, LoginRequestEntry> = {}
  const profiles: Record<string, Profile> = {}
  const settings: SettingsService =
    config?.services?.settings || createInMemorySettingsService()
  const userMapper: UserMapper =
    config?.services?.userMapper || createUserMapper(null, settings)
  const services = createTestServices({
    userMapper,
    settings,
    adverts: createInMemoryAdvertsRepository(adverts),
    profiles: createInMemoryProfileRepository(profiles),
    login: createInMemoryLoginService(userMapper, { db: logins }),
    ...config?.services,
  })

  return createTestApp(services).run(async server =>
    handler({
      user,
      gqlRequest: createGqlRequest(services.tokens, server, user),
      mappedGqlRequest: createMappedGqlRequest(services.tokens, server, user),
      server,
      services,
      adverts,
      profiles,
      logins,
      loginPolicies: loginPolicyAdapter(services.settings),
    })
  )
}
