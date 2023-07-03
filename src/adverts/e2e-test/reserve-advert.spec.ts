import { StatusCodes } from "http-status-codes"
import { end2endTest } from "../../test-utils"
import { createEmptyAdvert } from "../mappers"
import { AdvertWithMetaMutationResult } from "../types"
import { reserveAdvertMutation, updateAdvertMutation } from "./queries"

describe('reserveAdvert', () => {
	it('upates an advert in the database', () => end2endTest(async ({ gqlRequest, adverts, user }) => {
		adverts['advert-123'] = {
			...createEmptyAdvert(),
			id: 'advert-123',
			quantity: 5
		}
		
		const { status, body } = await gqlRequest(reserveAdvertMutation, { id: 'advert-123', quantity: 1} )
		expect(status).toBe(StatusCodes.OK)

		const result = body?.data?.reserveAdvert as AdvertWithMetaMutationResult
		// expect(adverts['advert-123']).toMatchObject(result?.advert as Advert)

		expect(adverts['advert-123'].reservations).toMatchObject([{
			reservedBy: user.id,
			quantity: 1
		}])
	}))
})