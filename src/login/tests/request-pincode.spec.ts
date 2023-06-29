import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { createTestApp } from '../../test-utils'
import { InMemoryLoginDatabase, createInMemoryLoginService } from '../in-memory-login-service/in-memory-login-service'
import { RequestPincodeResult } from '../types'

describe('request', () => {
	it('POST /api/v1/haffa/auth/request-pincode should save an entry in the login database', () => {
		const db: InMemoryLoginDatabase = {}
		
		return createTestApp({
			login: createInMemoryLoginService({ db }),
		})
			.run(async server => {
				const { status, body } = await request(server)
					.post('/api/v1/haffa/auth/request-pincode')
					.send({
						email: 'test@user.com',
					})
				expect(status).toBe(StatusCodes.OK)
				expect(body.status).toBe(RequestPincodeResult.accepted)
				expect(db).toMatchObject({
					'test@user.com': {},
				})
			})
	})

	it('POST /api/v1/haffa/auth/request-pincode email must be valid', () => {
		const db: InMemoryLoginDatabase = {}
		
		return createTestApp({
			login: createInMemoryLoginService({ db }),
		})
			.run(async server => {
				const { status, body } = await request(server)
					.post('/api/v1/haffa/auth/request-pincode')
					.send({
						email: 'not an email',
					})
				
				expect(status).toBe(StatusCodes.OK)
				expect(body.status).toBe(RequestPincodeResult.invalid)
				expect(Object.keys(db).length).toBe(0)
			})
	})
})