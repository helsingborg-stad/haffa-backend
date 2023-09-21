import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { advertsGqlSchema } from './adverts.gql.schema'
import {
  mapAdvertMutationResultToAdvertWithMetaMutationResult,
  mapAdvertToAdvertWithMeta,
  mapAdvertsToAdvertsWithMeta,
} from './mappers'
import { createAdvertMutations } from './advert-mutations'
import type { Services } from '../types'

export const createAdvertsGqlModule = (
  services: Pick<Services, 'adverts' | 'files' | 'notifications'>
): GraphQLModule => ({
  schema: advertsGqlSchema,
  resolvers: {
    Query: {
      // https://www.graphql-tools.com/docs/resolvers
      adverts: async ({ ctx: { user }, args: { filter } }) => {
        const l = await services.adverts.list(user, filter)
        return mapAdvertsToAdvertsWithMeta(user, l)
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
      reserveAdvert: async ({ ctx: { user }, args: { id, quantity } }) =>
        createAdvertMutations(services)
          .reserveAdvert(user, id, quantity)
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
      cancelAdvertClaim: async ({ ctx: { user }, args: { id, by, type } }) =>
        createAdvertMutations(services)
          .cancelAdvertClaim(user, id, by, type)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
      convertAdvertClaim: async ({
        ctx: { user },
        args: { id, by, type, newType },
      }) =>
        createAdvertMutations(services)
          .convertAdvertClaim(user, id, by, type, newType)
          .then(result =>
            mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)
          ),
    },
  },
})
