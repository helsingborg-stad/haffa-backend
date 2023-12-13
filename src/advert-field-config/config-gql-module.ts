import HttpStatusCodes from 'http-status-codes'
import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { advertFieldConfigGqlSchema } from './config.gql.schema'
import type { Services } from '../types'
import { normalizeRoles } from '../login'
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
