import type { Services } from '../types'
import { statsGqlSchema } from './stats.gql.schema'
import { statsAdapter } from './stats-adapter'
import type { GraphQLModule } from '../lib/gdi-api-node'

export const createStatsGqlModule = ({
  adverts,
}: Pick<Services, 'adverts'>): GraphQLModule => ({
  schema: statsGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      stats: async () => statsAdapter(adverts).getStats(),
    },
  },
})
