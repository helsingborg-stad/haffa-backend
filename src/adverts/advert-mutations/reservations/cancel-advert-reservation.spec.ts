import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimType } from '../../types'
import { expectAdvertMutationResult } from '../test-utils/expect-advert-mutation-result'
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
    const notifications = createTestNotificationServices({
      advertReservationWasCancelled,
    })
    return end2endTest(
      {
        services: { notifications },
      },
      async ({ gqlRequest, adverts, user }) => {
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
            },
            {
              by: user.id,
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
            },
            {
              by: user.id,
              at: '',
              quantity: 2,
              type: AdvertClaimType.reserved,
            },
            {
              by: 'someone else',
              at: '',
              quantity: 1,
              type: AdvertClaimType.reserved,
            },
          ],
        }

        await gqlRequest(cancelAdvertReservationMutation, {
          id: 'advert-123',
        }).then(expectAdvertMutationResult('cancelAdvertReservation'))

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
            user,
            3,
            adverts['advert-123']
          )
        )
      }
    )
  })
})
