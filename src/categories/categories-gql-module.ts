import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { categoriesGqlSchema } from './categories.gql.schema'
import { normalizeRoles } from '../login'

export const createCategoriesGqlModule = ({
  adverts,
  categories,
}: Pick<Services, 'adverts' | 'categories'>): GraphQLModule => ({
  schema: categoriesGqlSchema,
  resolvers: {
    Category: {
      // This is a computed property not stored in our internal model
      advertCount: async ({ source, ctx, cache }) => {
        const summary = await cache.getOrCreateCachedValue(
          'adverts-category-summary',
          () => adverts.countBy(ctx.user, 'category')
        )
        return summary[source.id] || 0
      },
    },
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      categories: async () => categories.getCategories(),
    },
    Mutation: {
      updateCategories: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditSystemCategories) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return categories.updateCategories(input)
      },
    },
  },
})
