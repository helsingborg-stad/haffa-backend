import HttpStatusCodes from 'http-status-codes'
import { termsGqlSchema } from './terms.gql.schema'
import type { Services } from '../types'
import { termsAdapter } from './mappers'
import { normalizeRoles } from '../login'
import type { GraphQLModule } from '../lib/gdi-api-node'

export const createTermsGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: termsGqlSchema,
  resolvers: {
    Query: {
      terms: () => termsAdapter(settings).getTerms(),
    },
    Mutation: {
      updateTerms: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditTerms) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return termsAdapter(settings).updateTerms(input)
      },
    },
  },
})
