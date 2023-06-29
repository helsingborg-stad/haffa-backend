import { end2endTest } from '../test-utils'
import { StatusCodes } from 'http-status-codes'
import { createAdvertMutation } from './queries'
import { AdvertInput } from '../adverts/types'

describe('createAdvert', () => {
	it('xxx', () => end2endTest(async ({ gqlRequest }) => {
		const input: AdvertInput = {
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

		expect(body?.data?.createAdvert).toMatchObject(input)
	}))
})