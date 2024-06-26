import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { mutationProps } from '../test-utils/gql-test-definitions'
import type { AdvertMutationResult } from '../../types'

const unarchiveAdvertMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!
) {
	unarchiveAdvert(id: $id) {
		${mutationProps}
	}
}
`

describe('archiveAdvert', () => {
  it('updates an advert in the database', () => {
    const advertWasUnarchived = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasUnarchived,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        // give us rights to handle claims
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canArchiveOwnAdverts'],
          },
        ])

        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: user.id,
          archivedAt: 'some date',
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'unarchiveAdvert',
          unarchiveAdvertMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toBeNull()
        expect(result.advert).toBeTruthy()

        T('should have archive data logged in database', () =>
          expect(adverts['advert-123'].archivedAt).toHaveLength(0)
        )

        T('should have notified about the interesting event', () =>
          expect(advertWasUnarchived).toHaveBeenCalledWith(
            user.id,
            expect.objectContaining(user),
            expect.objectContaining(adverts['advert-123'])
          )
        )
      }
    )
  })
})
