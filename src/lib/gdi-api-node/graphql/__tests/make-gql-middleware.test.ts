import { makeGqlMiddleware } from '../make-gql-middleware'

describe('makeGqlMiddleware', () => {
	it('parses {query, parameters}, executes endpoint and returns result as json', async () => {
		const query = 'query MyQuery {test}'
		const variables = { a: 1, b:'two' }
		const mv = makeGqlMiddleware(async ({ context, model, query, variables }) => ({
			'I, who is a endpoint, got this stuff': {
				query, variables,
			},
		}))

		// create a fake context which can be mutated (since thats the Koa way)
		const ctx = {
			request: {
				body: {
					query,
					variables,
				},
			},
			body: null, 
		}
		await mv(ctx as any)
		expect(ctx).toMatchObject({
			body: {
				'I, who is a endpoint, got this stuff': {
					query, variables,
				},
			},
		})
	})
})