import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { TxErrors } from '../../../transactions'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimType, type AdvertWithMetaMutationResult } from '../../types'
import { expectAdvertMutationResult } from '../test-utils/expect-advert-mutation-result'
import { mutationProps } from '../test-utils/gql-test-definitions'

const collectAdvertMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!
	$quantity: Int
) {
	collectAdvert(id: $id, quantity: $quantity) {
		${mutationProps}
	}
}
`

describe('collectAdvert', () => {
  it('creates reservation claim', () => {
    const advertWasCollected = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasCollected,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ gqlRequest, adverts, user }) => {
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          quantity: 5,
        }

        await gqlRequest(collectAdvertMutation, {
          id: 'advert-123',
          quantity: 1,
        }).then(expectAdvertMutationResult('collectAdvert'))

        T('should have collect logged in database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([
            {
              by: user.id,
              quantity: 1,
              type: AdvertClaimType.collected,
            },
          ])
        )

        T('should have notified about the interesting event', () =>
          expect(advertWasCollected).toHaveBeenCalledWith(
            user,
            1,
            adverts['advert-123']
          )
        )
      }
    )
  })

  it('denies overcollects', () => {
    const advertWasCollected = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasCollected,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ gqlRequest, adverts, user }) => {
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          quantity: 5,
        }

        const x = await gqlRequest(collectAdvertMutation, {
          id: 'advert-123',
          quantity: 10,
        })

        await gqlRequest(collectAdvertMutation, {
          id: 'advert-123',
          quantity: 10,
        }).then(
          expectAdvertMutationResult(
            'collectAdvert',
            TxErrors.TooManyReservations
          )
        )

        T('no collect should be written to database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([])
        )

        T('no notifications should be called', () =>
          expect(advertWasCollected).not.toHaveBeenCalled()
        )
      }
    )
  })
})
