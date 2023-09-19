import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { TxErrors } from '../../../transactions'
import { createEmptyAdvert } from '../../mappers'
import { AdvertClaimType } from '../../types'
import type { AdvertMutationResult } from '../../types'
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
      async ({
        mappedGqlRequest,
        adverts,
        user,
        loginPolicies,
        services: { userMapper },
      }) => {
        // give us rights to collect
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canCollectAdverts'],
          },
        ])

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          quantity: 5,
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'collectAdvert',
          collectAdvertMutation,
          {
            id: 'advert-123',
            quantity: 1,
          }
        )
        expect(result.status).toBeNull()
        expect(adverts['advert-123']).toMatchObject(result.advert!)

        T('should have collect logged in database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([
            {
              by: user.id,
              quantity: 1,
              type: AdvertClaimType.collected,
            },
          ])
        )

        // determine effective user when notifications where sent
        const mappedUser = await userMapper.mapAndValidateUser(user)
        T('should have notified about the interesting event', () =>
          expect(advertWasCollected).toHaveBeenCalledWith(
            mappedUser,
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
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        // give us rights to collect
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canCollectAdverts'],
          },
        ])

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          quantity: 5,
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'collectAdvert',
          collectAdvertMutation,
          {
            id: 'advert-123',
            quantity: 10,
          }
        )
        expect(result.status).toMatchObject(TxErrors.TooManyReservations)

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
