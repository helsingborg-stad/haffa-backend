import { StatusCodes } from 'http-status-codes'
import { end2endTest } from '../../test-utils'
import { createEmptyProfile } from '../mappers'
import { createEmptyAdvert } from '../../adverts/mappers'
import type { Advert } from '../../adverts/types'

const range = (n: number): any[] => Object.keys([...new Array(n)])

describe('removeProfile', () => {
  it('delete profile data and associated adverts', () =>
    end2endTest(
      null,
      async ({ user, profiles, adverts, loginPolicies, gqlRequest }) => {
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canManageProfile'],
          },
        ])
        const addProfile = (id: string) => {
          // eslint-disable-next-line no-param-reassign
          profiles[id] = createEmptyProfile()
        }
        const addAdvert = (advert: Advert) => {
          // eslint-disable-next-line no-param-reassign
          adverts[advert.id] = advert
        }

        // setup some profiles
        addProfile('keep.me')
        addProfile('keep.me.too')
        addProfile(user.id)

        // setup some adverts
        addAdvert(createEmptyAdvert({ id: 'keep.1', createdBy: 'keep.me' }))
        addAdvert(createEmptyAdvert({ id: 'keep.2', createdBy: 'keep.me.too' }))
        range(1000).forEach(i =>
          addAdvert(
            createEmptyAdvert({ id: `remove.${i}`, createdBy: user.id })
          )
        )
        addAdvert(
          createEmptyAdvert({ id: 'keep.last', createdBy: 'keep.me.too' })
        )

        const { status, body } = await gqlRequest(
          /* GraphQL */ `
            mutation Mutation($input: RemoveProfileInput!) {
              removeProfile(input: $input) {
                success
              }
            }
          `,
          { input: { removeAdverts: true } }
        )
        expect(status).toBe(StatusCodes.OK)
        expect(body?.data?.removeProfile?.success).toBe(true)
        expect(Object.keys(profiles)).toMatchObject(['keep.me', 'keep.me.too'])
        expect(Object.keys(adverts)).toMatchObject([
          'keep.1',
          'keep.2',
          'keep.last',
        ])
      }
    ))
})
