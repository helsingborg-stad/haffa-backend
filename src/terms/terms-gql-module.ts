import HttpStatusCodes from 'http-status-codes'
import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { termsGqlSchema } from './terms.gql.schema'
import type { Services } from '../types'
import { termsAdapter } from './mappers'
import { normalizeRoles } from '../login'

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
