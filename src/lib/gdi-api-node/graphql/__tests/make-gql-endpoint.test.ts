import { makeGqlEndpoint } from '../make-gql-endpoint'
import { GraphQLModule } from '../types'

const TestModule: GraphQLModule = {
	schema: `
        type TestData {
            id: String,
        }
        type Query {
            dataSync: TestData,
			dataAsync: TestData,
			dataPromise: TestData,
			dataAsyncPromise: TestData
        }
        `,
	resolvers: {
		Query: {
			dataSync: ({ ctx: { user: { id } } }) => ({ id }),
			dataAsync: async ({ ctx: { user: { id } } }) => ({ id }),
			dataPromise: ({ ctx: { user: { id } } }) => Promise.resolve({ id }),
			dataAsyncPromise: ({ ctx: { user: { id } } }) => Promise.resolve({ id }),
		},
	},
} 
describe('makeGqlEndpoint', () => {
	it('can handle compination of sync/async/promise resolvers', async () => {
		const ep = makeGqlEndpoint(TestModule)
		const { data } = await ep({
			context: {
				user: {
					id: 'test-id-123',
				},
			},
			query: `
				query TestQuery {
					dataSync {id}
					dataAsync {id}
					dataPromise {id}
					dataAsyncPromise {id}
				}`,
			variables: {},
		})
		expect(data).toMatchObject({
			dataSync: { id: 'test-id-123' },
			dataAsync: { id: 'test-id-123' },
			dataPromise: { id: 'test-id-123' },
			dataAsyncPromise: { id: 'test-id-123' },
		})
	}) 
})