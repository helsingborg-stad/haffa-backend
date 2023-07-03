import { StatusCodes } from 'http-status-codes'
import { end2endTest } from '../../test-utils'
import type { ProfileInput } from '../types'

describe('getProfile', () => {
  it('returns repository content with email set to calling user', () =>
    end2endTest(async ({ user, profiles, gqlRequest }) => {
      const input: ProfileInput = {
        phone: '123-45678',
        adress: 'Drottninggatan 14',
        zipCode: '25221',
        city: 'Helsingborg',
        country: 'Sverige',
      }
      const { status, body } = await gqlRequest(
        /* GraphQL */ `
          mutation Mutation($input: ProfileInput!) {
            updateProfile(input: $input) {
              city
              email
              adress
              country
              phone
              zipCode
            }
          }
        `,
        { input }
      )
      expect(status).toBe(StatusCodes.OK)
      expect(body?.data?.updateProfile).toMatchObject(input)
      expect(profiles[user.id]).toMatchObject({
        ...input,
        email: user.id,
      })
    }))
})
