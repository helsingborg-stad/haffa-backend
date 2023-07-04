import { StatusCodes } from "http-status-codes"
import { T, end2endTest } from "../../test-utils"
import { createEmptyAdvert } from "../mappers"
import { AdvertWithMetaMutationResult } from "../types"
import { reserveAdvertMutation } from "./queries"
import { NotificationService } from "../../notifications/types"

describe('reserveAdvert', () => {
	it('updates an advert in the database', () => {

		const advertWasReserved = jest.fn(async () => void 0)
		const notifications: NotificationService = ({
			advertWasReserved
		})
	
		return end2endTest(async ({ gqlRequest, adverts, user }) => {
			adverts['advert-123'] = {
				...createEmptyAdvert(),
				id: 'advert-123',
				quantity: 5
			}
			
			const { status, body } = await gqlRequest(reserveAdvertMutation, { id: 'advert-123', quantity: 1} )
			T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

			const result = body?.data?.reserveAdvert as AdvertWithMetaMutationResult
			// expect(adverts['advert-123']).toMatchObject(result?.advert as Advert)

		
			T('should have reservation logged in database', () => 
				expect(adverts['advert-123'].reservations).toMatchObject([{
					reservedBy: user.id,
					quantity: 1
				}]))


			T('should have notified about the interesting event', () =>
				expect(advertWasReserved).toHaveBeenCalledTimes(1)
			)
		}, {notifications})
	})

	it('denies overresevations', () => {
		const advertWasReserved = jest.fn(async () => void 0)
		const notifications: NotificationService = ({
			advertWasReserved
		})
	
		return end2endTest(async ({ gqlRequest, adverts, user }) => {
			adverts['advert-123'] = {
				...createEmptyAdvert(),
				id: 'advert-123',
				quantity: 5
			}
			
			const { status, body } = await gqlRequest(reserveAdvertMutation, { id: 'advert-123', quantity: 10} )
			T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

			const result = body?.data?.reserveAdvert as AdvertWithMetaMutationResult
			// expect(adverts['advert-123']).toMatchObject(result?.advert as Advert)

		
			T('no reservation should be written to database', () => 
				expect(adverts['advert-123'].reservations).toMatchObject([]))


			T('no notifications should be called', () =>
				expect(advertWasReserved).not.toHaveBeenCalled()
			)
		}, {notifications})
	})


})