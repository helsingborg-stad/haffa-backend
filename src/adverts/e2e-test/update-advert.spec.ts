import { StatusCodes } from "http-status-codes"
import { T, end2endTest } from "../../test-utils"
import { createEmptyAdvert, createEmptyAdvertInput } from "../mappers"
import type { AdvertInput, AdvertWithMetaMutationResult } from "../types"
import { updateAdvertMutation } from "./queries"
import { TxErrors } from "../../transactions"

describe('updateAdvert', () => {

	it('denies unauthorized attempts', () => end2endTest(null, async ({ gqlRequest, adverts }) => {
		adverts['advert-123'] = {
			...createEmptyAdvert(),
			createdBy: 'someone else',
			id: 'advert-123'
		}
		
		const input: AdvertInput = createEmptyAdvertInput()
		const { status, body } = await gqlRequest(updateAdvertMutation, { id: 'advert-123', input })
		T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

		const result = body?.data?.updateAdvert as AdvertWithMetaMutationResult

		T('status should reflect denied access', () => expect(result.status).toMatchObject(TxErrors.Unauthorized))
	}))


	it('updates an advert in the database', () => end2endTest(null, async ({ gqlRequest, adverts, user }) => {
		adverts['advert-123'] = {
			...createEmptyAdvert(),
			createdBy: user.id,
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
			category: 'c'
		}
		const { status, body } = await gqlRequest(updateAdvertMutation, { id: 'advert-123', input })
		T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

		const result = body?.data?.updateAdvert as AdvertWithMetaMutationResult

		T('returned advert should match input', () => expect(result?.advert).toMatchObject(input))
		// expect(adverts['advert-123']).toMatchObject(input)

		T('database should be updated with input', () => expect(adverts[result?.advert?.id as string]).toMatchObject(input))
		T('database should be updated with input', () => expect(adverts['advert-123']).toMatchObject(input))
	}))
})
