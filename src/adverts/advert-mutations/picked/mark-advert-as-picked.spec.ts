import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
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
    const advertWasPickedOwner = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
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
            roles: ['canManagePicked', 'canEditOwnAdverts'],
          },
        ])

        const startTime = new Date().toISOString()

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: user.id,
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'markAdvertAsPicked',
          markAdvertAsPickedMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toBeNull()

        T('should have notified about the interesting event', () =>
          expect(advertWasPickedOwner).toHaveBeenCalledWith(
            expect.objectContaining(user),
            adverts['advert-123']
          )
        )

        T('timestamp should be updated', () => {
          const { pickedAt } = adverts['advert-123']
          expect(startTime <= pickedAt).toBe(true)
          expect(pickedAt <= new Date().toISOString()).toBe(true)
        })
      }
    )
  })
})
