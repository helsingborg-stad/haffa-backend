import { StatusCodes } from "http-status-codes"
import { T, createTestNotificationServices, end2endTest } from "../../test-utils"
import { createEmptyAdvert } from "../mappers"
import { AdvertClaimType, type Advert, type AdvertWithMetaMutationResult } from "../types"
import { collectAdvertMutation, reserveAdvertMutation } from "./queries"

describe('collectAdvert', () => {
	it('creates reservation claim', () => {
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
			
			T('should have collect logged in database', () => 
				expect(adverts['advert-123'].claims).toMatchObject([{
					by: user.id,
					quantity: 1,
					type: AdvertClaimType.collected
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

			T('no collect should be written to database', () => 
				expect(adverts['advert-123'].claims).toMatchObject([]))

			T('no notifications should be called', () =>
				expect(advertWasCollected).not.toHaveBeenCalled()
			)
		})
	})
})
