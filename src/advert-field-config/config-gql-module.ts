import HttpStatusCodes from 'http-status-codes'
import type { GraphQLModule } from '../lib/gdi-api-node'
import { normalizeRoles } from '../login'
import type { Services } from '../types'
import { advertFieldConfigGqlSchema } from './config.gql.schema'
import { advertFieldConfigAdapter } from './mappers'

export const createAdvertFieldConfigGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: advertFieldConfigGqlSchema,
  resolvers: {
    Query: {
      advertFieldConfig: () =>
        advertFieldConfigAdapter(settings).getFieldConfig(),
    },
    Mutation: {
      updateFieldConfig: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditTerms) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return advertFieldConfigAdapter(settings).updateFieldConfig(input)
      },
    },
  },
})
