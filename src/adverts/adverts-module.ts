import { ApplicationContext, ApplicationModule, GraphQLModule, makeGqlEndpoint, makeGqlMiddleware, requireJwtUser } from '@helsingborg-stad/gdi-api-node'
import { AdvertsRepository } from './types'
import { haffaGqlSchema } from './haffa.gql.schema'

const createAdvertsModule = (adverts: AdvertsRepository): GraphQLModule => ({
	schema: haffaGqlSchema,
	resolvers: {
		Query: {
			// https://www.graphql-tools.com/docs/resolvers
			adverts: ({ ctx: { user } }) => adverts.list(),
		},
		Mutation: {
			createAdvert: ({ args: { input } }) => adverts.create(input),
		},
	},
})


export const advertsModule = (adverts: AdvertsRepository): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
	haffaGQL: requireJwtUser(makeGqlMiddleware(makeGqlEndpoint(createAdvertsModule(adverts)))),
})
