import { StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { createTestApp, registerTestApi } from './test-utils'

describe('POST /api/v1/test-operation', () => {
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