import { end2endTest } from '../../test-utils'
import { StatusCodes } from 'http-status-codes'
import { createEmptyProfile } from '../mappers'
import { Profile } from '../types'

describe('getProfile', () => {
	it('returns repository content with email set to calling user', () => end2endTest(async ({ user, profiles, gqlRequest }) => {
		const profile: Profile = {
			phone: '123-45678',
			...createEmptyProfile(),
		}
		profiles[user.id] = profile
		const { status, body } = await gqlRequest(/* GraphQL */`
			query Query {
				profile {
					city
					email
					adress
					country
					phone
					zipCode
				}
			}
			`, {})
		expect(status).toBe(StatusCodes.OK)
		expect(body?.data?.profile).toMatchObject(profile)
	}))
})