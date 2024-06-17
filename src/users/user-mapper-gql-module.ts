import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { userMapperGqlSchema } from './user-mapper.gql.schema'
import { userMapperConfigAdapter } from './user-mapper-config-adapter'
import { normalizeRoles } from '../login'
import type { GraphQLModule } from '../lib/gdi-api-node'

export const createUserMapperGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: userMapperGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      userMappingConfiguration: async () =>
        userMapperConfigAdapter(settings).getUserMapperConfig(),
    },
    Mutation: {
      updateUserMappingConfiguration: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditSystemLoginPolicies) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return userMapperConfigAdapter(settings).updateUserMapperConfig(input)
      },
    },
  },
})
