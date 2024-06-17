import { StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { createTestApp, registerTestApi } from './test-utils'

describe('POST /api/v1/test-operation', () => {
	it('validates parameters', () => createTestApp()
		.run(async server => {
			const { status } = await request(server)
				.post('/api/v1/test-operation')
				.send({ this_body_is_missing_required_property_query: true })

			// NOTE: validation occurs albeit we didn't 
			// define a handler for the actual API operation
			expect(status).toBe(StatusCodes.BAD_REQUEST)
		}))
	it('can validate responses when {validateResponses: true}', () => createTestApp()
		.use(registerTestApi({
			testOperation: async (ctx) => {
				ctx.body = { this_response_is_missing_required_id_property: true }
			},
		}))
		.run(async server => {
			const { status } = await request(server)
				.post('/api/v1/test-operation')
				.send({ query: 'a test query' })

			// NOTE: validation occurs albeit we didn't 
			// define a handler for teh actual API operation
			expect(status).toBe(StatusCodes.BAD_GATEWAY)
		}))
	it('works just fine', () => createTestApp()
		.use(registerTestApi({
			testOperation: async (ctx) => {
				const { request: { body: { query } } } = ctx as any
				ctx.body = {
					id: '1234',
					answer: `Please google "${query}"`,
				}
			},
		}))
		.run(async server => {
			const { status, body } = await request(server)
				.post('/api/v1/test-operation')
				.send({ query: 'what time is it?' })
			expect(status).toBe(StatusCodes.OK)
			expect(body).toMatchObject({
				id: '1234',
				answer: 'Please google "what time is it?"',
			})
		}))
})