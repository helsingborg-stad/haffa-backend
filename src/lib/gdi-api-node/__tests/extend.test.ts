import { StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { createTestApp } from './test-utils'

describe('POST /api/v1/test-operation', () => {
	it('can be extended with downstream middleware', () => createTestApp()
		.use(({ extend }) => {
			extend({
				// we extend by composing in additional middleware that should be combined
				// with subsequent koa api handlers 
				compose: mv => (ctx, next) => {
					ctx.downstreamMessage = 'hello downstream'
					return mv(ctx, next)
				},
			})
		})
		.use(({ registerKoaApi }) => registerKoaApi({
			testOperation: async (ctx) => {
				ctx.body = {
					id: '1234',
					answer: ctx.downstreamMessage,
				}
			},
		}))
		.run(async server => {
			const { status, body } = await request(server)
				.post('/api/v1/test-operation')
				.send({ query: '?' })
			expect(status).toBe(StatusCodes.OK)
			expect(body).toMatchObject({
				answer: 'hello downstream',
			})
		}))
})