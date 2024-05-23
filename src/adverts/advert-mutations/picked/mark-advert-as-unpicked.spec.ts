import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult } from '../../types'
import { mutationProps } from '../test-utils/gql-test-definitions'

const markAdvertAsUnpickedMutation = /* GraphQL */ `
  mutation Mutation(
	  $id: ID!
  ) {
	  markAdvertAsUnpicked(id: $id) {
		  ${mutationProps}
	  }
  }
  `

describe('markAdvertAsPicked', () => {
  it('updates pickedAt at notifies', () => {
    const advertWasUnpickedOwner = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasUnpickedOwner,
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

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: 'some@owner',
          pickedAt: new Date().toISOString(),
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'markAdvertAsUnpicked',
          markAdvertAsUnpickedMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toBeNull()

        T('should have notified about the interesting event', () =>
          expect(advertWasUnpickedOwner).toHaveBeenCalledWith(
            'some@owner',
            expect.objectContaining(user),
            adverts['advert-123']
          )
        )

        T('timestamp should be updated', () => {
          const { pickedAt } = adverts['advert-123']
          expect(pickedAt).toBe('')
        })
      }
    )
  })
})
