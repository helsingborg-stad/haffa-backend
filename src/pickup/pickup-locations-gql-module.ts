import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { normalizeRoles } from '../login'
import type { GraphQLModule } from '../lib/gdi-api-node'
import { pickupLocationsGqlSchema } from './pickup-locations.gql.schema'
import { pickupLocationsAdapter } from './pickup-locations-adapter'
import type { HaffaUser } from '../login/types'

const resolveAdminProperty = <T>(
  value: T,
  defaultValue: T,
  user?: HaffaUser
): T => (user?.roles?.canManageLocations ? value : defaultValue)

export const createPickupLocationsGqlModule = ({
  adverts,
  settings,
}: Pick<Services, 'adverts' | 'settings'>): GraphQLModule => ({
  schema: pickupLocationsGqlSchema,
  resolvers: {
    PickupLocation: {
      // hide specific values from unauthorized eyes
      notifyEmail: ({ ctx: { user }, source }) =>
        resolveAdminProperty(source.notifyEmail, '', user),
      trackingName: ({ ctx: { user }, source }) =>
        resolveAdminProperty(source.trackingName, '', user),
      tags: ({ ctx: { user }, source }) =>
        resolveAdminProperty(source.tags, [], user),
    },
    Query: {
      pickupLocations: async () =>
        pickupLocationsAdapter(settings).getPickupLocations(),
      pickupLocationsByAdvert: async ({ ctx: { user }, args: { id } }) => {
        const advert = await adverts.getAdvert(user, id)
        return advert
          ? pickupLocationsAdapter(settings)
              .createPickupLocationMatcher()
              .then(m => m(advert))
          : []
      },
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
