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
    const advertReservationWasCancelledOwner = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertReservationWasCancelled,
      advertReservationWasCancelledOwner,
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
            roles: ['canManageOwnAdvertsHistory', 'canManageAllAdverts'],
          },
        ])
        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'some@owner',
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
              by: 'claims@user',
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
            by: 'claims@user',
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
            'claims@user',
            expect.objectContaining(user),
            1,
            adverts['advert-123']
          )
        )

        T('should have notified about the interesting event', () =>
          expect(advertReservationWasCancelledOwner).toHaveBeenCalledWith(
            'some@owner',
            expect.objectContaining(user),
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
    const advertCollectWasCancelledOwner = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertCollectWasCancelled,
      advertCollectWasCancelledOwner,
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
            roles: ['canManageOwnAdvertsHistory', 'canManageAllAdverts'],
          },
        ])
        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'some@owner',
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
              by: 'claims@user',
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
            by: 'claims@user',
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
            'claims@user',
            expect.objectContaining(user),
            1,
            adverts['advert-123']
          )
        )
        T('should have notified about the interesting event', () =>
          expect(advertCollectWasCancelledOwner).toHaveBeenCalledWith(
            'some@owner',
            expect.objectContaining(user),
            1,
            adverts['advert-123']
          )
        )
      }
    )
  })
})
