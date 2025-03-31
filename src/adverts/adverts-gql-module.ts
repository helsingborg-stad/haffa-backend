import HttpStatusCodes from 'http-status-codes'
import { advertsGqlSchema } from './adverts.gql.schema'
import {
  mapAdvertMutationResultToAdvertWithMetaMutationResult,
  mapAdvertToAdvertWithMeta,
  mapAdvertsToAdvertsWithMeta,
} from './mappers'
import { createAdvertMutations } from './advert-mutations'
import type { Services } from '../types'
import type { GraphQLModule } from '../lib/gdi-api-node'
import type { Advert } from './types'
import { pickupLocationsAdapter } from '../pickup/pickup-locations-adapter'

export const createAdvertsGqlModule = (
  services: Pick<
    Services,
    | 'getAdvertMeta'
    | 'adverts'
    | 'categories'
    | 'files'
    | 'notifications'
    | 'settings'
    | 'syslog'
    | 'workflow'
  >
): GraphQLModule => ({
  schema: advertsGqlSchema,
  resolvers: {
    Advert: {
      // handle advert.notes visibility
      notes: async ({ source }) => (source.meta.canEdit ? source.notes : ''),

      // for meta, we introdue a hidden/non-exposed backrefence to the advert for ceratin computations later on
      meta: async ({ source }) => ({ ...source.meta, '@advert': source }),
    },

    AdvertMeta: {
      // handle advert.meta.claims visibility
      claims: async ({ source }) =>
        source.canManageClaims ? source.claims : [],

      // Computed field
      hasPickupLocations: async ({ source, cache }) => {
        // get source advert
        const advert = source['@advert'] as Advert
        // compute once per request a tag filter based on currect pickup locations
        const pickupLocationMatcher = await cache.getOrCreateCachedValue(
          'match-pickup-locations-by-advert-tags',
          async () =>
            pickupLocationsAdapter(
              services.settings
            ).createPickupLocationMatcher()
        )
        return pickupLocationMatcher(advert).length > 0
      },
    },

    AdvertMutationResult: {
      // categories is present in GQL model but not in internal model
      categories: () => services.categories.getCategories(),
    },
    AdvertList: {
      // categories is present in GQL model but not in internal model
      categories: () => services.categories.getCategories(),
    },
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      adverts: async ({ ctx: { user }, args: { filter } }) => {
        const l = await services.adverts.list(user, filter)
        return {
          ...l,
          adverts: mapAdvertsToAdvertsWithMeta(user, l.adverts, services),
        }
      },
      getAdvert: async ({ ctx: { user }, args: { id } }) => {
        const advert = await services.adverts.getAdvert(user, id)
        return mapAdvertToAdvertWithMeta(user, advert, services)
      },
      advertSummaries: async ({ ctx }) => {
        const { user } = ctx

        if (!user) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        return services.adverts.getAdvertSummaries()
      },
    },
    Mutation: {
      createAdvert: async ({ ctx: { user }, args: { input } }) =>
        createAdvertMutations(services)
          .createAdvert(user, input)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      updateAdvert: async ({ ctx: { user }, args: { id, input } }) =>
        createAdvertMutations(services)
          .updateAdvert(user, id, input)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      removeAdvert: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .removeAdvert(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      reserveAdvert: async ({
        ctx: { user },
        args: { id, quantity, pickupLocation },
      }) =>
        createAdvertMutations(services)
          .reserveAdvert(user, id, quantity, pickupLocation)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      cancelAdvertReservation: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .cancelAdvertReservation(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      collectAdvert: async ({ ctx: { user }, args: { id, quantity } }) =>
        createAdvertMutations(services)
          .collectAdvert(user, id, quantity)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      archiveAdvert: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .archiveAdvert(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      unarchiveAdvert: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .unarchiveAdvert(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      cancelAdvertClaim: async ({
        ctx: { user },
        args: { id, by, type, impersonate },
      }) =>
        createAdvertMutations(services)
          .cancelAdvertClaim(user, id, by, type, impersonate)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      convertAdvertClaim: async ({
        ctx: { user },
        args: { id, by, type, newType, impersonate },
      }) =>
        createAdvertMutations(services)
          .convertAdvertClaim(user, id, by, type, newType, impersonate)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      renewAdvertClaim: async ({
        ctx: { user },
        args: { id, by, type, impersonate },
      }) =>
        createAdvertMutations(services)
          .renewAdvertClaim(user, id, by, type, impersonate)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      returnAdvert: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .returnAdvert(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      joinAdvertWaitlist: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .joinAdvertWaitlist(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),

      leaveAdvertWaitlist: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .leaveAdvertWaitlist(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      markAdvertAsPicked: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .markAdvertAsPicked(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      markAdvertAsUnpicked: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .markAdvertAsUnpicked(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
      patchAdvertTags: async ({ ctx: { user }, args: { id, add, remove } }) =>
        createAdvertMutations(services)
          .patchAdvertTags(user, id, { add, remove })
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(
              user,
              result,
              services
            )
          ),
    },
  },
})
