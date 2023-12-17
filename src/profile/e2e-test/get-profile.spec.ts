import { StatusCodes } from 'http-status-codes'
import { end2endTest } from '../../test-utils'
import { createEmptyProfile } from '../mappers'
import type { Profile } from '../types'

describe('getProfile', () => {
  it('returns repository content with email set to calling user', () =>
    end2endTest(null, async ({ user, profiles, gqlRequest }) => {
      const profile: Profile = {
        ...createEmptyProfile(),
        phone: '123-45678',
      }
      profiles[user.id] = profile
      const { status, body } = await gqlRequest(
        /* GraphQL */ `
          query Query {
            profile {
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
        {}
      )
      expect(status).toBe(StatusCodes.OK)
      expect(body?.data?.profile).toMatchObject(profile)
    }))
})
