import { ApplicationContext, ApplicationModule, GraphQLModule, makeGqlEndpoint, makeGqlMiddleware, requireJwtUser } from '@helsingborg-stad/gdi-api-node'
import { AdvertsRepository, AdvertsUser } from './types'
import { haffaGqlSchema } from './haffa.gql.schema'
import { mapCreateAdvertInputToAdvert } from './mappers'
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

const createAdvertsModule = (adverts: AdvertsRepository): GraphQLModule => ({
	schema: haffaGqlSchema,
	resolvers: {
		Query: {
			// https://www.graphql-tools.com/docs/resolvers
			adverts: async ({ ctx: { user }, args: { filter } }) => {
				const u = mapContextUserToUser(user)
				return (await adverts.list(filter))
					.map(advert => ({
						...advert,
						permissions: getAdvertPermissions(advert, u),
					}))
			},
			getAdvert: ({ args: { id } }) => adverts.getAdvert(id),
		},
		Mutation: {
			createAdvert: ({ ctx: { user }, args: { input } }) => adverts.create(mapCreateAdvertInputToAdvert(input,mapContextUserToUser(user))),
		},
	},
})


export const advertsModule = (adverts: AdvertsRepository): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
	haffaGQL: requireJwtUser(makeGqlMiddleware(makeGqlEndpoint(createAdvertsModule(adverts)))),
})
