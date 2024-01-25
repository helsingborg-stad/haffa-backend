import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
import { AdvertClaimType } from '../../types'
import { mutationProps } from '../test-utils/gql-test-definitions'

const cancelAdvertReservationMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!
) {
	cancelAdvertReservation(id: $id) {
		${mutationProps}
	}
}
`

describe('cancelAdvertReservation', () => {
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
        // give us rights to handle reservations
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canReserveAdverts'],
          },
        ])

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
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
              by: user.id,
              at: '',
              quantity: 2,
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
          'cancelAdvertReservation',
          cancelAdvertReservationMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toBeNull()

        T('reservations by user should be removed from database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([
            {
              by: 'someone I used to know',
              quantity: 2,
            },
            {
              by: 'someone else',
              quantity: 1,
            },
          ])
        )

        T('should have notified about the interesting event', () =>
          expect(advertReservationWasCancelled).toHaveBeenCalledWith(
            expect.objectContaining(user),
            3,
            adverts['advert-123']
          )
        )
        T('should have notified about the interesting event', () =>
          expect(advertReservationWasCancelledOwner).toHaveBeenCalledWith(
            expect.objectContaining(user),
            3,
            adverts['advert-123']
          )
        )
      }
    )
  })
})
