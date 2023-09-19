import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { TxErrors } from '../../../transactions'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
import { AdvertClaimType } from '../../types'
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
      async ({
        mappedGqlRequest,
        adverts,
        user,
        loginPolicies,
        services: { userMapper },
      }) => {
        // give us rights to handle claims
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
          quantity: 5,
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'reserveAdvert',
          reserveAdvertMutation,
          {
            id: 'advert-123',
            quantity: 1,
          }
        )
        expect(result.status).toBeNull()

        T('should have reservation logged in database', () =>
          expect(adverts['advert-123'].claims).toMatchObject([
            {
              by: user.id,
              quantity: 1,
              type: AdvertClaimType.reserved,
            },
          ])
        )

        // determine effective user when notifications where sent
        const mappedUser = await userMapper.mapAndValidateUser(user)
        T('should have notified about the interesting event', () =>
          expect(advertWasReserved).toHaveBeenCalledWith(
            mappedUser,
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
      async ({ mappedGqlRequest, adverts, user }) => {
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          quantity: 5,
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'reserveAdvert',
          reserveAdvertMutation,
          {
            id: 'advert-123',
            quantity: 10,
          }
        )
        expect(result.status).toMatchObject(TxErrors.TooManyReservations)

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
