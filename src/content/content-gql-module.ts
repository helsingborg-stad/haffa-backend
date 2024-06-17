import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { contentGqlSchema } from './content.gql.schema'
import { normalizeRoles } from '../login'
import type { GraphQLModule } from '../lib/gdi-api-node'

export const createContentGqlModule = ({
  content,
}: Pick<Services, 'content'>): GraphQLModule => ({
  schema: contentGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      viewComposition: async () => content.getComposition(),
    },
    Mutation: {
      updateComposition: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canManageContent) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return content.updateComposition(input)
      },
    },
  },
})
