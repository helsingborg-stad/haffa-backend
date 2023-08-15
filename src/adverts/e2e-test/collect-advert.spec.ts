import { StatusCodes } from "http-status-codes"
import { T, createTestNotificationServices, end2endTest } from "../../test-utils"
import { createEmptyAdvert } from "../mappers"
import type { Advert, AdvertWithMetaMutationResult } from "../types"
import { collectAdvertMutation, reserveAdvertMutation } from "./queries"

describe('collectAdvert', () => {
	it('also creates reservation if missing', () => {
		const advertWasCollected = jest.fn(async () => void 0)
		const notifications = createTestNotificationServices({
			advertWasCollected,	
		})
	
		return end2endTest({services: {notifications}}, async ({ gqlRequest, adverts, user }) => {
			adverts['advert-123'] = {
				...createEmptyAdvert(),
				id: 'advert-123',
				quantity: 5
			}
			
			const { status, body } = await gqlRequest(collectAdvertMutation, { id: 'advert-123', quantity: 1} )
			T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

			const result = body?.data?.collectAdvert as AdvertWithMetaMutationResult
			// expect(adverts['advert-123']).toMatchObject(result?.advert as Advert)
			
			T('should have reservation logged in database', () => 
				expect(adverts['advert-123'].reservations).toMatchObject([{
					reservedBy: user.id,
					quantity: 1
				}]))

			T('should have collect logged in database', () => 
				expect(adverts['advert-123'].collects).toMatchObject([{
					collectedBy: user.id,
					quantity: 1
				}]))

			T('should have notified about the interesting event', () =>
				expect(advertWasCollected).toHaveBeenCalledWith(user, 1, adverts['advert-123'])
			)
		})
	})

	
	it('denies overcollects', () => {
		const advertWasCollected = jest.fn(async () => void 0)
		const notifications = createTestNotificationServices({
			advertWasCollected,	
		})
	
		return end2endTest({services: {notifications}}, async ({ gqlRequest, adverts, user }) => {
			adverts['advert-123'] = {
				...createEmptyAdvert(),
				id: 'advert-123',
				quantity: 5
			}
			
			const { status, body } = await gqlRequest(collectAdvertMutation, { id: 'advert-123', quantity: 10} )
			T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

			const result = body?.data?.reserveAdvert as AdvertWithMetaMutationResult
			// expect(adverts['advert-123']).toMatchObject(result?.advert as Advert)

		
			T('no reservation should be written to database', () => 
				expect(adverts['advert-123'].reservations).toMatchObject([]))

			T('no collect should be written to database', () => 
				expect(adverts['advert-123'].collects).toMatchObject([]))

			T('no notifications should be called', () =>
				expect(advertWasCollected).not.toHaveBeenCalled()
			)
		})
	})
})
