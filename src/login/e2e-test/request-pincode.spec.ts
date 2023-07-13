import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { createTestNotificationServices, end2endTest } from '../../test-utils'
import { RequestPincodeStatus } from '../types'

describe('request', () => {
	it('POST /api/v1/haffa/auth/request-pincode should save an entry in the login database and notify', () => {
		const pincodeRequested = jest.fn()
		return end2endTest({
			services: {
				notifications: createTestNotificationServices({
					pincodeRequested
				})
			}
		}, async ({ server, logins }) => {
			const { status, body } = await request(server)
				.post('/api/v1/haffa/auth/request-pincode')
				.send({
					email: 'test@user.com',
				})
			expect(status).toBe(StatusCodes.OK)
			expect(body.status).toBe(RequestPincodeStatus.accepted)
			expect(logins).toMatchObject({
				'test@user.com': {},
			})
			expect(pincodeRequested).toHaveBeenCalledWith('test@user.com', expect.anything())
		})
	})

	it('POST /api/v1/haffa/auth/request-pincode email must be valid', () => 
		end2endTest(null, async ({ server, logins }) => {
			const { status, body } = await request(server)
				.post('/api/v1/haffa/auth/request-pincode')
				.send({
					email: 'not an email',
				})
				
			expect(status).toBe(StatusCodes.OK)
			expect(body.status).toBe(RequestPincodeStatus.invalid)
			expect(Object.keys(logins).length).toBe(0)
		}))
})