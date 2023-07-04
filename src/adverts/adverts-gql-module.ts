import type { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { advertsGqlSchema } from './adverts.gql.schema'
import { mapAdvertMutationResultToAdvertWithMetaMutationResult, mapAdvertToAdvertWithMeta, mapAdvertsToAdvertsWithMeta } from './mappers'
import { createAdvertMutations } from './advert-mutations'
import type { Services } from '../types'

export const createAdvertsGqlModule = (services: Pick<Services, 'adverts'|'files'|'notifications'>): GraphQLModule => ({
	schema: advertsGqlSchema,
	resolvers:{
		Query: {
			// https://www.graphql-tools.com/docs/resolvers
			adverts: async ({ ctx: { user }, args: { filter } }) => {
				const l = await services.adverts.list(filter)
				return  mapAdvertsToAdvertsWithMeta(user, l)
			},
			getAdvert: async ({ ctx: { user }, args: { id } }) => {
				const advert = await services.adverts.getAdvert(id)
				return mapAdvertToAdvertWithMeta(user, advert)
			},
		},
		Mutation: {
			createAdvert: async ({ ctx: { user }, args: { input } }) => createAdvertMutations(services)
				.createAdvert(user, input)
				.then(result => mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)),
			updateAdvert: async ({ ctx: { user }, args: { id, input } }) => createAdvertMutations(services)
				.updateAdvert(user, id, input)
				.then(result => mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)),
			reserveAdvert: async ({ ctx:{ user }, args: { id, quantity } }) =>  createAdvertMutations(services)
				.reserveAdvert(user, id, quantity)
				.then(result => mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)),
			cancelAdvertReservation: async ({ ctx: { user }, args: { id } }) => createAdvertMutations(services)
				.cancelAdvertReservation(user, id)
				.then(result => mapAdvertMutationResultToAdvertWithMetaMutationResult(user, result)),
		},
	},
})