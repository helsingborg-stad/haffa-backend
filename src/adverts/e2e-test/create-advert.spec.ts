import { end2endTest } from '../../test-utils'
import { StatusCodes } from 'http-status-codes'
import { createAdvertMutation } from './queries'
import { Advert, AdvertInput } from '../types'
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

		const created: Advert = body?.data?.createAdvert as Advert

		expect(created).toMatchObject(input)
		expect(adverts[created.id]).toMatchObject(input)
	}))
})