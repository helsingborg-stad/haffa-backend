import { StatusCodes } from "http-status-codes"
import { T, end2endTest } from "../../test-utils"
import { createEmptyAdvert } from "../mappers"
import { AdvertWithMetaMutationResult } from "../types"
import { reserveAdvertMutation } from "./queries"

describe('reserveAdvert', () => {
	it('updates an advert in the database', () => end2endTest(async ({ gqlRequest, adverts, user }) => {
		adverts['advert-123'] = {
			...createEmptyAdvert(),
			id: 'advert-123',
			quantity: 5
		}
		
		const { status, body } = await gqlRequest(reserveAdvertMutation, { id: 'advert-123', quantity: 1} )
		T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

		const result = body?.data?.reserveAdvert as AdvertWithMetaMutationResult
		// expect(adverts['advert-123']).toMatchObject(result?.advert as Advert)

	
		T('should have reswervation logged in database', () => 
			expect(adverts['advert-123'].reservations).toMatchObject([{
				reservedBy: user.id,
				quantity: 1
			}]))
	}))
})