import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { categoriesGqlSchema } from './categories.gql.schema'
import { categoryAdapter } from './category-adapter'

export const createCategoriesGqlModule = ({
  adverts,
  settings,
}: Pick<Services, 'adverts' | 'settings'>): GraphQLModule => ({
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
      categories: async () => categoryAdapter(settings).getCategories(),
    },
    Mutation: {
      updateCategories: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!user.roles.includes('admin')) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return categoryAdapter(settings).updateCategories(input)
      },
    },
  },
})
