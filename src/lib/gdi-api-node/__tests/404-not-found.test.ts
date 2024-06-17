import { StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { createTestApp } from './test-utils'


describe('GET /missing/resource', () => {
	it('gives 404 not found', () => createTestApp()
		.run(async server => {
			const { status } = await request(server)
				.post('/missing/resource')
			expect(status).toBe(StatusCodes.NOT_FOUND)
		}))
})