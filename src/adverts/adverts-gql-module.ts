import { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { AdvertInput } from './types'
import { FilesService } from '../files/types'
import { advertsGqlSchema } from './adverts.gql.schema'
import { mapAdvertMutationResultToAdvertWithMetaMutationResult, mapAdvertToAdvertWithMeta, mapAdvertsToAdvertsWithMeta } from './mappers'
import { createAdvertMutations } from './advert-mutations'
import { Services } from '../types'

const convertInput = async (input: AdvertInput, files: FilesService): Promise<AdvertInput> => {
	return {
		...input,
		images: await Promise.all(input
			.images
			.filter(v => v)
			.filter(({ url }) => url)
			.map(image => files.tryConvertDataUrlToUrl(image.url).then(url => ({
				...image,
				url: url || image.url,
			})))),
	}
}

export const createAdvertsGqlModule = (services: Pick<Services, 'adverts'|'files'>): GraphQLModule => ({
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
		},
	},
})