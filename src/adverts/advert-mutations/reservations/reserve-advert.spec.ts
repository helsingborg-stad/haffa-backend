import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { TxErrors } from '../../../transactions'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimType } from '../../types'
import { expectAdvertMutationResult } from '../test-utils/expect-advert-mutation-result'
import { mutationProps } from '../test-utils/gql-test-definitions'

const reserveAdvertMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!
	$quantity: Int
) {
	reserveAdvert(id: $id, quantity: $quantity) {
		${mutationProps}
	}
}
`

describe('reserveAdvert', () => {
  it('updates an advert in the database', () => {
    const advertWasReserved = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasReserved,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ gqlRequest, adverts, user }) => {
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          quantity: 5,
        }

        await gqlRequest(reserveAdvertMutation, {
          id: 'advert-123',
          quantity: 1,
        }).then(expectAdvertMutationResult('reserveAdvert'))

        T('should have reservation logged in database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([
            {
              by: user.id,
              quantity: 1,
              type: AdvertClaimType.reserved,
            },
          ])
        )

        T('should have notified about the interesting event', () =>
          expect(advertWasReserved).toHaveBeenCalledWith(
            user,
            1,
            adverts['advert-123']
          )
        )
      }
    )
  })

  it('denies overresevations', () => {
    const advertWasReserved = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasReserved,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ gqlRequest, adverts, user }) => {
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          quantity: 5,
        }

        await gqlRequest(reserveAdvertMutation, {
          id: 'advert-123',
          quantity: 10,
        }).then(
          expectAdvertMutationResult(
            'reserveAdvert',
            TxErrors.TooManyReservations
          )
        )

        T('no reservation should be written to database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([])
        )

        T('no notifications should be called', () =>
          expect(advertWasReserved).not.toHaveBeenCalled()
        )
      }
    )
  })
})
