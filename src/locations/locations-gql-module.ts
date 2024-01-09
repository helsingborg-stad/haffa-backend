import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { normalizeRoles } from '../login'
import { locationsGqlSchema } from './locations.gql.schema'
import { locationsAdapter } from './locations-adapter'

export const createLocationsGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: locationsGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      locations: async () => locationsAdapter(settings).getLocations(),
    },
    Mutation: {
      updateLocations: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canEditTerms) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return locationsAdapter(settings).updateLocations(input)
      },
    },
  },
})
