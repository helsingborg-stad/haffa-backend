import { EntityResolverMap } from '@helsingborg-stad/gdi-api-node/graphql'
import { HaffaUser } from '../login/types'
import { Advert, AdvertInput, AdvertsRepository } from '../adverts/types'
import { getAdvertPermissions } from '../adverts/permissions'
import { FilesService } from '../files/types'

const createAdvertMapper = (user: HaffaUser) => {
	return (advert: Advert|null) => (
		advert ? {
			...advert,
			permissions: getAdvertPermissions(advert, user),
		} : null)
}

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

export const advertsResolver = (adverts: AdvertsRepository, files: FilesService): EntityResolverMap => ({
	Query: {
		// https://www.graphql-tools.com/docs/resolvers
		adverts: async ({ ctx: { user }, args: { filter } }) => {
			const l = await adverts.list(filter)
			return l.map(createAdvertMapper(user))
		},
		getAdvert: async ({ ctx: { user }, args: { id } }) => {
			const advert = await adverts.getAdvert(id)
			return createAdvertMapper(user)(advert)
		},
	},
	Mutation: {
		createAdvert: async ({ ctx: { user }, args: { input } }) => {
			const fixedInput = await convertInput(input, files)
			const advert = await adverts.create(user, fixedInput)
			return createAdvertMapper(user)(advert)
		},
		updateAdvert: async ({ ctx: { user }, args: { id, input } }) => {
			const fixedInput = await convertInput(input, files)
			const advert = await adverts.update(id, user, fixedInput)
			return createAdvertMapper(user)(advert)
		},
	},

})