import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { end2endTest } from '../../test-utils'
import { RequestPincodeResult } from '../types'

describe('request', () => {
	it('POST /api/v1/haffa/auth/request-pincode should save an entry in the login database', () => 
		end2endTest(async ({ server, logins }) => {
			const { status, body } = await request(server)
				.post('/api/v1/haffa/auth/request-pincode')
				.send({
					email: 'test@user.com',
				})
			expect(status).toBe(StatusCodes.OK)
			expect(body.status).toBe(RequestPincodeResult.accepted)
			expect(logins).toMatchObject({
				'test@user.com': {},
			})
		}))

	it('POST /api/v1/haffa/auth/request-pincode email must be valid', () => 
		end2endTest(async ({ server, logins }) => {
			const { status, body } = await request(server)
				.post('/api/v1/haffa/auth/request-pincode')
				.send({
					email: 'not an email',
				})
				
			expect(status).toBe(StatusCodes.OK)
			expect(body.status).toBe(RequestPincodeResult.invalid)
			expect(Object.keys(logins).length).toBe(0)
		}))
})