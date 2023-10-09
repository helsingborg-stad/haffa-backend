import { makeUser } from '../../../login'
import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
import { AdvertClaimType } from '../../types'
import { mutationProps } from '../test-utils/gql-test-definitions'

const cancelAdvertClaimMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!,
	$by: String!,
	$type: AdvertClaimType!
) {
	cancelAdvertClaim(id: $id, by: $by, type: $type) {
		${mutationProps}
	}
}
`
describe('cancelAdvertClaim - reserved', () => {
  it('removes all reservations (by user) from database', () => {
    const advertReservationWasCancelled = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertReservationWasCancelled,
    })
    return end2endTest(
      {
        services: { notifications },
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
              by: user.id,
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
              events: [],
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
          'cancelAdvertClaim',
          cancelAdvertClaimMutation,
          {
            id: 'advert-123',
            by: user.id,
            type: AdvertClaimType.reserved,
          }
        )
        expect(result.status).toBeNull()

        T('reservations by user should be removed from database', () =>
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
          ])
        )

        T('should have notified about the interesting event', () =>
          expect(advertReservationWasCancelled).toHaveBeenCalledWith(
            makeUser({ id: user.id }),
            1,
            adverts['advert-123']
          )
        )
      }
    )
  })
})

describe('cancelAdvertClaim - collected', () => {
  it('removes all reservations (by user) from database', () => {
    const advertCollectWasCancelled = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertCollectWasCancelled,
    })
    return end2endTest(
      {
        services: { notifications },
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
              type: AdvertClaimType.collected,
              events: [],
            },
            {
              by: user.id,
              at: '',
              quantity: 1,
              type: AdvertClaimType.collected,
              events: [],
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: AdvertClaimType.collected,
              events: [],
            },
          ],
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'cancelAdvertClaim',
          cancelAdvertClaimMutation,
          {
            id: 'advert-123',
            by: user.id,
            type: AdvertClaimType.collected,
          }
        )
        expect(result.status).toBeNull()

        T('collects by user should be removed from database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([
            {
              by: 'someone I used to know',
              at: '',
              quantity: 2,
              type: 'collected',
              events: [],
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: 'collected',
              events: [],
            },
          ])
        )

        T('should have notified about the interesting event', () =>
          expect(advertCollectWasCancelled).toHaveBeenCalledWith(
            makeUser({ id: user.id }),
            1,
            adverts['advert-123']
          )
        )
      }
    )
  })
})
