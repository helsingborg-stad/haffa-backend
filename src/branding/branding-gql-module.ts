import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { brandingGqlSchema } from './branding.gql.schema'
import { normalizeRoles } from '../login'
import { brandingAdapter } from './branding-adapter'

export const createBrandingGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: brandingGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      brandingOptions: async ({ ctx }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditTerms) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return brandingAdapter(settings).getBrandingOptions()
      },
    },
    Mutation: {
      updateBrandingOptions: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditTerms) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return brandingAdapter(settings).updateBrandingOptions(input)
      },
    },
  },
})
