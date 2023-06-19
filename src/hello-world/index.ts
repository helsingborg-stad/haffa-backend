import { makeGqlEndpoint, makeGqlMiddleware } from '@helsingborg-stad/gdi-api-node'
import { GraphQLModule } from '@helsingborg-stad/gdi-api-node'
import { requireJwtUser } from '@helsingborg-stad/gdi-api-node/modules/jwt-user'
import { ApplicationContext, ApplicationModule } from '@helsingborg-stad/gdi-api-node'

const createHelloWorldModule = (): GraphQLModule => ({
	schema: `
        type Hello {
            world: String,
        }
        type Query {
            hello: Hello
        }
        `,
	resolvers: {
		Query: {
			// https://www.graphql-tools.com/docs/resolvers
			hello: ({ ctx: { user } }) => {
				return {
					world: `Hello ${user.id}`,
				}
			},
		},
	},
})

const helloWorldModule = (): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => registerKoaApi({
	helloWorldGQL: requireJwtUser(makeGqlMiddleware(makeGqlEndpoint(createHelloWorldModule()))),
})

export default helloWorldModule
