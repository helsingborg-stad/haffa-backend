import { ApplicationContext, ApplicationModule, GraphQLModule, makeGqlEndpoint, makeGqlMiddleware, requireJwtUser } from '@helsingborg-stad/gdi-api-node'
import { AdvertsRepository } from './types'

const createAdvertsModule = (adverts: AdvertsRepository): GraphQLModule => ({
	schema: `
		type Advert {
			title: String
		}

        type Query {
            adverts: [Advert]
        }
        `,
	resolvers: {
		Query: {
			// https://www.graphql-tools.com/docs/resolvers
			adverts: ({ ctx: { user } }) => adverts.list(),
		},
	},
})


export const advertsModule = (adverts: AdvertsRepository): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
	haffaGQL: requireJwtUser(makeGqlMiddleware(makeGqlEndpoint(createAdvertsModule(adverts)))),
})
