import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { normalizeRoles } from '../login'
import type { GraphQLModule } from '../lib/gdi-api-node'
import { pickupLocationsGqlSchema } from './pickup-locations.gql.schema'
import { pickupLocationsAdapter } from './pickup-locations-adapter'

export const createPickupLocationsGqlModule = ({
  settings,
}: Pick<Services, 'settings'>): GraphQLModule => ({
  schema: pickupLocationsGqlSchema,
  resolvers: {
    Query: {
      pickupLocations: async () =>
        pickupLocationsAdapter(settings).getPickupLocations(),
    },
    Mutation: {
      updatePickupLocations: async ({ ctx, args: { input } }) => {
        const { user } = ctx
        if (!normalizeRoles(user?.roles).canManageLocations) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return pickupLocationsAdapter(settings).updatePickupLocations(input)
      },
    },
  },
})
