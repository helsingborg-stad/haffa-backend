import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
import { makeReservedClaim } from '../test-utils/claims'
import { mutationProps } from '../test-utils/gql-test-definitions'

const markAdvertAsPickedMutation = /* GraphQL */ `
  mutation Mutation(
	  $id: ID!
  ) {
	  markAdvertAsPicked(id: $id) {
		  ${mutationProps}
	  }
  }
  `

describe('markAdvertAsPicked', () => {
  it('updates pickedAt at notifies', () => {
    const advertWasPicked = jest.fn(async () => undefined)
    const advertWasPickedOwner = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertWasPicked,
      advertWasPickedOwner,
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
            roles: [
              'canManagePicked',
              'canEditOwnAdverts',
              'canManageAllAdverts',
            ],
          },
        ])

        const startTime = new Date().toISOString()

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'some@owner',
          quantity: 10,
          claims: [
            makeReservedClaim({ by: 'reserver1' }),
            makeReservedClaim({ by: 'reserver2' }),
          ],
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'markAdvertAsPicked',
          markAdvertAsPickedMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toBeNull()

        T('owner is notified', () =>
          expect(advertWasPickedOwner).toHaveBeenCalledWith(
            'some@owner',
            expect.objectContaining(user),
            adverts['advert-123']
          )
        )

        T('reservers are notified', () => {
          expect(advertWasPicked).toHaveBeenCalledWith(
            'reserver1',
            expect.objectContaining(user),
            adverts['advert-123']
          )
          expect(advertWasPicked).toHaveBeenCalledWith(
            'reserver2',
            expect.objectContaining(user),
            adverts['advert-123']
          )
        })

        T('timestamp should be updated', () => {
          const { pickedAt } = adverts['advert-123']
          expect(startTime <= pickedAt).toBe(true)
          expect(pickedAt <= new Date().toISOString()).toBe(true)
        })
      }
    )
  })
})
