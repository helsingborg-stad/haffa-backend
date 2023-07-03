import { StatusCodes } from "http-status-codes"
import { end2endTest } from "../../test-utils"
import { createEmptyAdvert, createEmptyAdvertInput } from "../mappers"
import { AdvertInput, AdvertWithMetaMutationResult } from "../types"
import { updateAdvertMutation } from "./queries"

describe('updateAdvert', () => {
	it('updates an advert in the database', () => end2endTest(async ({ gqlRequest, adverts }) => {
		adverts['advert-123'] = {
			...createEmptyAdvert(),
			id: 'advert-123'
		}
		
		const input: AdvertInput = {
			...createEmptyAdvertInput(),
			title: 't',
			description: 'd',
			images: [],
			unit: 'u',
			material: 'm',
			condition: 'c',
			usage: 'u',
		}
		const { status, body } = await gqlRequest(updateAdvertMutation, { id: 'advert-123', input })
		expect(status).toBe(StatusCodes.OK)

		const result = body?.data?.updateAdvert as AdvertWithMetaMutationResult

		expect(result?.advert).toMatchObject(input)
		// expect(adverts['advert-123']).toMatchObject(input)

		expect(adverts[result?.advert?.id as string]).toMatchObject(input)
		expect(adverts['advert-123']).toMatchObject(input)
	}))
})