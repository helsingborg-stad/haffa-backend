import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { apiKeysGqlSchema } from './api-keys.gql.schema'
import { normalizeRoles } from '../login'
import { apiKeysAdapter } from '.'

export const createApiKeysGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: apiKeysGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      apiKeys: async ({ ctx }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditApiKeys) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return apiKeysAdapter(settings).getApiKeys()
      },
    },
    Mutation: {
      updateApiKeys: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditApiKeys) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return apiKeysAdapter(settings).updateApiKeys(input)
      },
    },
  },
})
