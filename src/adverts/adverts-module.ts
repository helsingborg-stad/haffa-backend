import { ApplicationContext, ApplicationModule, GraphQLModule, makeGqlEndpoint, makeGqlMiddleware, requireJwtUser } from '@helsingborg-stad/gdi-api-node'
import { Advert, AdvertsRepository, AdvertsUser } from './types'
import { haffaGqlSchema } from './haffa.gql.schema'
import { getAdvertPermissions } from './permissions'

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

const createAdvertsModule = (adverts: AdvertsRepository): GraphQLModule => ({
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
				const advert = await adverts.create(mapContextUserToUser(user), input)
				return createAdvertMapper(user)(advert)
			},
			updateAdvert: async ({ ctx: { user }, args: { id, input } }) => {
				const u = mapContextUserToUser(user)
				const advert = await adverts.update(id, u, input)
				return createAdvertMapper(user)(advert)
			},
		},
	},
})


export const advertsModule = (adverts: AdvertsRepository): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
	haffaGQL: requireJwtUser(makeGqlMiddleware(makeGqlEndpoint(createAdvertsModule(adverts)))),
})
