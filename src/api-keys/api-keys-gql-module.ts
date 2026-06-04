import HttpStatusCodes from 'http-status-codes'
import type { GraphQLModule } from '../lib/gdi-api-node'
import { normalizeRoles } from '../login'
import type { Services } from '../types'
import { apiKeysAdapter } from '.'
import { apiKeysGqlSchema } from './api-keys.gql.schema'

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
