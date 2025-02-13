import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { normalizeRoles } from '../login'
import { tagsGqlSchema } from './tags.gql.schema'
import { tagsAdapter } from './tags-adapter'
import type { GraphQLModule } from '../lib/gdi-api-node'

export const createTagsGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: tagsGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      tagDescriptions: async () => tagsAdapter(settings).getTagDescriptions(),
    },
    Mutation: {
      updateTagDescriptions: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditTerms) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return tagsAdapter(settings).updateTagDescriptions(input)
      },
    },
  },
})
