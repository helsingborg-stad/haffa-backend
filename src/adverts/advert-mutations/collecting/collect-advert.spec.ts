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
    const advertWasCollected = jest.fn(async () => undefined)
    const advertWasCollectedOwner = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertWasCollected,
      advertWasCollectedOwner,
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
          createdBy: 'test@owner',
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
              events: [],
            },
          ])
        )

        T('should have notified about the interesting event', () =>
          expect(advertWasCollected).toHaveBeenCalledWith(
            user.id,
            expect.objectContaining(user),
            1,
            adverts['advert-123'],
            null
          )
        )
        T('should have notified about the interesting event', () =>
          expect(advertWasCollectedOwner).toHaveBeenCalledWith(
            'test@owner',
            expect.objectContaining(user),
            1,
            adverts['advert-123'],
            null
          )
        )
      }
    )
  })

  it('denies overcollects', () => {
    const advertWasCollected = jest.fn(async () => undefined)
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

  it('should set picked at collect', () => {
    const advertWasCollected = jest.fn(async () => undefined)
    const advertWasCollectedOwner = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertWasCollected,
      advertWasCollectedOwner,
    })
    const workflow = {
      get pickOnCollect() {
        return true
      },
    }
    const spy = jest.spyOn(workflow, 'pickOnCollect', 'get')

    return end2endTest(
      { services: { notifications, workflow } },
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
          quantity: 1,
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

        T('should be updated in database', () =>
          expect(adverts['advert-123'].pickedAt).toHaveLength(
            '2025-01-17T13:35:25.725Z'.length
          )
        )

        T('should have checked configuration', () =>
          expect(spy).toHaveBeenCalled()
        )
      }
    )
  })
})
