import { end2endTest } from '../../test-utils'
import { StatusCodes } from 'http-status-codes'
import { createAdvertMutation } from './queries'
import { Advert, AdvertInput, AdvertWithMetaMutationResult } from '../types'
import { createEmptyAdvertInput } from '../mappers'


describe('createAdvert', () => {
	it('creates an advert in the database', () => end2endTest(async ({ gqlRequest, adverts }) => {
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
		const { status, body } = await gqlRequest(createAdvertMutation, { input })
		
		expect(status).toBe(StatusCodes.OK)


		expect(status).toBe(StatusCodes.OK)

		const result = body?.data?.createAdvert as AdvertWithMetaMutationResult

		expect(result?.advert).toMatchObject(input)

		expect(adverts[result?.advert?.id as string]).toMatchObject(input)
	}))
})