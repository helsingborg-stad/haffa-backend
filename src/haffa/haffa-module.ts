import { requireHaffaUser } from '../login/require-haffa-user'
import type { Services } from '../types'
import { createHaffaGqlModule } from './haffa-gql-module'
import type { ApplicationContext } from '../lib/gdi-api-node'
import { makeGqlEndpoint, makeGqlMiddleware } from '../lib/gdi-api-node'

export const graphQLModule =
  (services: Services) =>
  ({ registerKoaApi }: ApplicationContext): void =>
    registerKoaApi({
      haffaGQL: requireHaffaUser(
        services.userMapper,
        makeGqlMiddleware(makeGqlEndpoint(createHaffaGqlModule(services)))
      ),
    })
