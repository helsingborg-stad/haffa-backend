import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import type { EntityResolverMap } from '@helsingborg-stad/gdi-api-node/graphql'
import type { Services } from '../types'
import { createAdvertsGqlModule } from '../adverts/adverts-gql-module'
import { createProfileGqlModule } from '../profile/profile-gql-module'
import { createTermsGqlModule } from '../terms/terms-gql-module'
import { createLoginPoliciesGqlModule } from '../login-policies'
import { createCategoriesGqlModule } from '../categories'

export const createHaffaGqlModule = ({
  adverts,
  files,
  profiles,
  notifications,
  settings,
}: Pick<
  Services,
  'adverts' | 'files' | 'profiles' | 'notifications' | 'settings'
>): GraphQLModule =>
  mergeModules(
    createAdvertsGqlModule({ adverts, files, notifications }),
    createProfileGqlModule(profiles),
    createTermsGqlModule(),
    createCategoriesGqlModule({ settings }),
    createLoginPoliciesGqlModule({ settings })
  )

const mergeModules = (...modules: GraphQLModule[]): GraphQLModule => ({
  schema: modules.map(({ schema }) => schema).join(''),
  resolvers: mergeResolvers(modules.map(({ resolvers }) => resolvers)),
})
const mergeResolvers = (resolvers: EntityResolverMap[]): EntityResolverMap => {
  const result: EntityResolverMap = {}
  resolvers.forEach(resolver => {
    Object.entries(resolver).forEach(([type, typeResolver]) => {
      result[type] = {
        ...result[type],
        ...typeResolver,
      }
    })
  })
  return result
}
