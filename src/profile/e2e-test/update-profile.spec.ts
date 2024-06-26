import { StatusCodes } from 'http-status-codes'
import { end2endTest } from '../../test-utils'
import type { ProfileInput } from '../types'

describe('getProfile', () => {
  it('returns repository content with email set to calling user', () =>
    end2endTest(null, async ({ user, profiles, loginPolicies, gqlRequest }) => {
      await loginPolicies.updateLoginPolicies([
        {
          emailPattern: user.id,
          roles: ['canManageProfile'],
        },
      ])

      const input: ProfileInput = {
        name: 'Foo',
        phone: '123-45678',
        adress: 'Drottninggatan 14',
        zipCode: '25221',
        city: 'Helsingborg',
        country: 'Sverige',
        organization: 'SLF',
      }
      const { status, body } = await gqlRequest(
        /* GraphQL */ `
          mutation Mutation($input: ProfileInput!) {
            updateProfile(input: $input) {
              name
              city
              email
              adress
              country
              phone
              zipCode
              organization
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
