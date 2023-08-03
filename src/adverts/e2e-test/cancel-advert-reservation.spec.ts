import { StatusCodes } from 'http-status-codes'
import { T, createTestNotificationServices, end2endTest } from '../../test-utils'
import { createEmptyAdvert } from '../mappers'
import { cancelAdvertReservationMutation } from './queries'
import type { AdvertWithMetaMutationResult } from '../types'

describe('cancelAdvertReservation', () => {
	it('removes all reservations (by user) from database', () => {
		const advertReservationWasCancelled = jest.fn(async () => void 0)
		const notifications = createTestNotificationServices({
			advertReservationWasCancelled
		})
		return end2endTest({
			services: {notifications}
		}, async ({ gqlRequest, adverts, user }) => {
			adverts['advert-123'] = {
				...createEmptyAdvert(),
				id: 'advert-123',
				quantity: 50,
				reservations: [ {
					reservedBy: 'someone I used to know',
					reservedAt: '',
					quantity: 2
				},{
					reservedBy: user.id,
					reservedAt: '',
					quantity: 1,
				}, {
					reservedBy: user.id,
					reservedAt: '',
					quantity: 2,
				}, {
					reservedBy: 'someone else',
					reservedAt: '',
					quantity: 1,
				},
				],
			}
			
			const { status, body } = await gqlRequest(cancelAdvertReservationMutation, { id: 'advert-123' } )
			T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

			const result = body?.data?.reserveAdvert as AdvertWithMetaMutationResult
			// expect(adverts['advert-123']).toMatchObject(result?.advert as Advert)

		
			T('reservations by user should be removed from database', () => 
				expect(adverts['advert-123'].reservations).toMatchObject([{
					reservedBy: 'someone I used to know',
					quantity: 2
				},{
					reservedBy: 'someone else',
					quantity: 1,
				}]))

			T('should have notified about the interesting event', () =>
				expect(advertReservationWasCancelled).toHaveBeenCalledWith(user, 3, adverts['advert-123'])
			)
		})
	})
})

