import { ApplicationContext, ApplicationModule, GraphQLModule, makeGqlEndpoint, makeGqlMiddleware, requireJwtUser } from '@helsingborg-stad/gdi-api-node'
import { Advert, AdvertInput, AdvertsRepository, AdvertsUser } from './types'
import { haffaGqlSchema } from './haffa.gql.schema'
import { getAdvertPermissions } from './permissions'
import { FilesService } from '../files/types'

const validate = (test: boolean, errorMessage: string): boolean => {
	if (!test) {
		throw new Error(errorMessage)
	}
	return true
}

const mapContextUserToUser = (user: any): AdvertsUser => ({
	id: validate(user && typeof user.id === 'string', 'Expected user.id from JWT to be string') && user.id,
	roles: validate(user && Array.isArray(user.roles) && user.roles.every(role => typeof role === 'string'), 'Expected user.roles from JWT to be string[]') && user.roles,
})

const createAdvertMapper = (user: any) => {
	const u = mapContextUserToUser(user)
	return (advert: Advert|null) => (
		advert ? {
			...advert,
			permissions: getAdvertPermissions(advert, u),
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

const createAdvertsModule = (adverts: AdvertsRepository, files: FilesService): GraphQLModule => ({
	schema: haffaGqlSchema,
	resolvers: {
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
			terms: () => ({
				unit: [ 'st', 'm', 'dm', 'cm', 'mm', 'm²', 'dm²', 'cm²', 'mm²', 'm³', 'dm³', 'cm³', 'mm³', 'l', 'kg', 'hg', 'g', 'mg' ],
				material: [ 'Trä', 'Plast', 'Metall', 'Textil', 'Annat' ],
				condition: [ 'Nyskick', 'Bra', 'Sliten' ],
				usage: [ 'Inomhus', 'Utomhus' ],
			
			}),
		},
		Mutation: {
			createAdvert: async ({ ctx: { user }, args: { input } }) => {
				const fixedInput = await convertInput(input, files)
				const advert = await adverts.create(mapContextUserToUser(user), fixedInput)
				return createAdvertMapper(user)(advert)
			},
			updateAdvert: async ({ ctx: { user }, args: { id, input } }) => {
				const fixedInput = await convertInput(input, files)
				const u = mapContextUserToUser(user)
				const advert = await adverts.update(id, u, fixedInput)
				return createAdvertMapper(user)(advert)
			},
		},
	},
})


export const advertsModule = (adverts: AdvertsRepository, files: FilesService): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
	haffaGQL: requireJwtUser(makeGqlMiddleware(makeGqlEndpoint(createAdvertsModule(adverts, files)))),
})
