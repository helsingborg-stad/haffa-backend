import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { mutationProps } from '../test-utils/gql-test-definitions'
import type { AdvertMutationResult } from '../../types'

const archiveAdvertMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!
) {
	archiveAdvert(id: $id) {
		${mutationProps}
	}
}
`

describe('archiveAdvert', () => {
  it('updates an advert in the database and notifies', () => {
    const advertWasArchived = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasArchived,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        // give us rights to archive
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
        }

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'archiveAdvert',
          archiveAdvertMutation,
          {
            id: 'advert-123',
          }
        )
        expect(result.status).toBeNull()
        expect(result.advert).toBeTruthy()

        T('should have archive data logged in database', () =>
          expect(adverts['advert-123'].archivedAt).toMatch(/^\d{4}-\d{2}-\d{2}/)
        )

        T('should have notified about the interesting event', () =>
          expect(advertWasArchived).toHaveBeenCalledWith(
            user.id,
            expect.objectContaining(user),
            expect.objectContaining(adverts['advert-123'])
          )
        )
      }
    )
  })
})
