import { makeUser } from '../../../login'
import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
import { AdvertClaimEventType, AdvertClaimType } from '../../types'
import { mutationProps } from '../test-utils/gql-test-definitions'

const renewAdvertClaimMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!,
	$by: String!,
	$type: AdvertClaimType!
) {
	renewAdvertClaim(id: $id, by: $by, type: $type) {
		${mutationProps}
	}
}
`

describe('renewAdvertClaim', () => {
  it('updates created date, clears events and doesnt notify', () => {
    const advertCollectWasRenewed = jest.fn()
    const advertCollectWasRenewedOwner = jest.fn()
    const renewNotifications = createTestNotificationServices({
      advertCollectWasRenewed,
      advertCollectWasRenewedOwner,
    })

    return end2endTest(
      {
        services: { notifications: renewNotifications },
      },
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        // give us rights to handle claims
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canManageOwnAdvertsHistory'],
          },
        ])
        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: user.id,
          quantity: 50,
          claims: [
            {
              by: 'someone I used to know',
              at: '',
              quantity: 2,
              type: AdvertClaimType.reserved,
              events: [],
            },
            {
              // this one is expected to mutate
              by: 'renew-user',
              at: '',
              quantity: 2,
              type: AdvertClaimType.collected,
              events: [
                {
                  type: AdvertClaimEventType.reminder,
                  at: '',
                },
              ],
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
              events: [],
            },
          ],
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'renewAdvertClaim',
          renewAdvertClaimMutation,
          {
            id: 'advert-123',
            by: 'renew-user',
            type: AdvertClaimType.collected,
          }
        )
        expect(result.status).toBeNull()

        T('claim should have timestamp near current time', () => {
          const at = adverts['advert-123'].claims.find(
            claim =>
              claim.by === 'renew-user' &&
              claim.type === AdvertClaimType.collected
          )?.at!

          expect(Date.now() - new Date(at).getTime()).toBeLessThan(10 * 1000)
        })

        T('claim should be updated in database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([
            {
              by: 'someone I used to know',
              at: '',
              quantity: 2,
              type: 'reserved',
              events: [],
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: 'reserved',
              events: [],
            },
            {
              by: 'renew-user',
              // at: '',
              quantity: 2,
              type: AdvertClaimType.collected,
              events: [],
            },
          ])
        )
        T('notoifications should have been called', () => {
          expect(advertCollectWasRenewed).toHaveBeenCalledWith(
            'renew-user',
            expect.objectContaining(user),
            2,
            adverts['advert-123']
          )
          expect(advertCollectWasRenewedOwner).toHaveBeenCalledWith(
            user.id,
            expect.objectContaining(user),
            2,
            adverts['advert-123']
          )
        })
      }
    )
  })
})
