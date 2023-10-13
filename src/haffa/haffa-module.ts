import type { ApplicationContext } from '@helsingborg-stad/gdi-api-node'
import {
  makeGqlEndpoint,
  makeGqlMiddleware,
} from '@helsingborg-stad/gdi-api-node'
import { requireHaffaUser } from '../login/require-haffa-user'
import type { Services } from '../types'
import { createHaffaGqlModule } from './haffa-gql-module'

export const graphQLModule =
  (
    services: Pick<
      Services,
      | 'userMapper'
      | 'adverts'
      | 'categories'
      | 'files'
      | 'profiles'
      | 'notifications'
      | 'settings'
      | 'jobs'
    >
  ) =>
  ({ registerKoaApi }: ApplicationContext): void =>
    registerKoaApi({
      haffaGQL: requireHaffaUser(
        services.userMapper,
        makeGqlMiddleware(makeGqlEndpoint(createHaffaGqlModule(services)))
      ),
    })
