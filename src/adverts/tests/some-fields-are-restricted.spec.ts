import { end2endTest } from '../../test-utils'
import { createEmptyAdvert } from '../mappers'
import {
  advertProps,
  advertWithMetaProps,
} from '../advert-mutations/test-utils/gql-test-definitions'
import { AdvertClaimType } from '../types'
import type { Advert, AdvertClaim } from '../types'
import type { HaffaUser } from '../../login/types'
import type { LoginPolicy } from '../../login-policies/types'

describe('adverts GQL emits/masks values based on permissions', () => {
  interface TestCase {
    createLoginPolicies?: (user: HaffaUser) => LoginPolicy[]
    sourceAdvert: Partial<Advert>
    expectedResult: Partial<any /* AdvertWithMeta */>
  }

  const makeTestClaim = (patch?: Partial<AdvertClaim>): AdvertClaim => ({
    quantity: 1,
    by: 'some@person.com',
    at: '2020-01-01',
    type: AdvertClaimType.reserved,
    events: [],
    ...patch,
  })
  const makeTestClaimWithoutEvents = (
    patch?: Partial<AdvertClaim>
  ): Omit<AdvertClaim, 'events'> => {
    const { quantity, by, at, type } = makeTestClaim(patch)
    return { quantity, by, at, type }
  }

  const FieldValuesShouldBeMasked: [string, TestCase][] = [
    [
      'acccess to notes is restricted',
      {
        sourceAdvert: { notes: 'a private note' },
        expectedResult: { notes: '' },
      },
    ],
    [
      'acccess to notes is allowed to editor',
      {
        createLoginPolicies: user => [
          {
            emailPattern: user.id,
            roles: ['canEditOwnAdverts', 'canManageAllAdverts'],
            deny: false,
          } as LoginPolicy,
        ],
        sourceAdvert: { notes: 'a private note' },
        expectedResult: { notes: 'a private note' },
      },
    ],
    [
      'access to claims is restricted (GDPR)',
      {
        sourceAdvert: {
          claims: [makeTestClaim()],
        },
        expectedResult: {
          meta: {
            claims: [],
          },
        },
      },
    ],
    [
      'access to claims is allowed when stars align',
      {
        createLoginPolicies: user => [
          {
            emailPattern: user.id,
            roles: ['canManageAllAdverts', 'canManageOwnAdvertsHistory'],
            deny: false,
          } as LoginPolicy,
        ],
        sourceAdvert: {
          claims: [makeTestClaim()],
        },
        expectedResult: {
          meta: {
            claims: [makeTestClaimWithoutEvents()],
          },
        },
      },
    ],
  ]

  it.each(FieldValuesShouldBeMasked)(
    'value masking: %s',
    (_, { sourceAdvert, expectedResult, createLoginPolicies }) =>
      end2endTest(
        null,
        async ({ user, adverts, mappedGqlRequest, loginPolicies }) => {
          await loginPolicies.updateLoginPolicies(
            createLoginPolicies?.(user) || []
          )

          // eslint-disable-next-line no-param-reassign
          adverts.a1 = createEmptyAdvert(sourceAdvert)

          const result = await mappedGqlRequest<any>(
            'getAdvert',
            `query Query($id: ID!) { 
				getAdvert(id: $id) {
					${advertWithMetaProps}
		  		}
	  		}`,
            { id: 'a1' }
          )
          expect(result).toMatchObject(expectedResult)
        }
      )
  )
})
