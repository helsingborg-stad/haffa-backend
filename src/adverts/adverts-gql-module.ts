import { advertsGqlSchema } from './adverts.gql.schema'
import {
  mapAdvertMutationResultToAdvertWithMetaMutationResult,
  mapAdvertToAdvertWithMeta,
  mapAdvertsToAdvertsWithMeta,
} from './mappers'
import { createAdvertMutations } from './advert-mutations'
import type { Services } from '../types'
import type { GraphQLModule } from '../lib/gdi-api-node'

export const createAdvertsGqlModule = (
  services: Pick<
    Services,
    'adverts' | 'categories' | 'files' | 'notifications' | 'syslog'
  >
): GraphQLModule => ({
  schema: advertsGqlSchema,
  resolvers: {
    Advert: {
      // handle advert.notes visibility
      notes: async ({ source }) => (source.meta.canEdit ? source.notes : ''),
    },

    AdvertMeta: {
      // handle advert.meta.claims visibility
      claims: async ({ source }) =>
        source.canManageClaims ? source.claims : [],
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
          adverts: mapAdvertsToAdvertsWithMeta(user, l.adverts),
        }
      },
      getAdvert: async ({ ctx: { user }, args: { id } }) => {
        const advert = await services.adverts.getAdvert(user, id)
        return mapAdvertToAdvertWithMeta(user, advert)
      },
    },
    Mutation: {
      createAdvert: async ({ ctx: { user }, args: { input } }) =>
        createAdvertMutations(services)
          .createAdvert(user, input)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      updateAdvert: async ({ ctx: { user }, args: { id, input } }) =>
        createAdvertMutations(services)
          .updateAdvert(user, id, input)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      removeAdvert: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .removeAdvert(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      reserveAdvert: async ({
        ctx: { user },
        args: { id, quantity, pickupLocation },
      }) =>
        createAdvertMutations(services)
          .reserveAdvert(user, id, quantity, pickupLocation)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      cancelAdvertReservation: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .cancelAdvertReservation(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      collectAdvert: async ({ ctx: { user }, args: { id, quantity } }) =>
        createAdvertMutations(services)
          .collectAdvert(user, id, quantity)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      archiveAdvert: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .archiveAdvert(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      unarchiveAdvert: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .unarchiveAdvert(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      cancelAdvertClaim: async ({
        ctx: { user },
        args: { id, by, type, impersonate },
      }) =>
        createAdvertMutations(services)
          .cancelAdvertClaim(user, id, by, type, impersonate)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      convertAdvertClaim: async ({
        ctx: { user },
        args: { id, by, type, newType, impersonate },
      }) =>
        createAdvertMutations(services)
          .convertAdvertClaim(user, id, by, type, newType, impersonate)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      renewAdvertClaim: async ({
        ctx: { user },
        args: { id, by, type, impersonate },
      }) =>
        createAdvertMutations(services)
          .renewAdvertClaim(user, id, by, type, impersonate)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      returnAdvert: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .returnAdvert(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      joinAdvertWaitlist: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .joinAdvertWaitlist(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),

      leaveAdvertWaitlist: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .leaveAdvertWaitlist(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      markAdvertAsPicked: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .markAdvertAsPicked(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      markAdvertAsUnpicked: async ({ ctx: { user }, args: { id } }) =>
        createAdvertMutations(services)
          .markAdvertAsUnpicked(user, id)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      patchAdvertTags: async ({ ctx: { user }, args: { id, add, remove } }) =>
        createAdvertMutations(services)
          .patchAdvertTags(user, id, { add, remove })
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
    },
  },
})
