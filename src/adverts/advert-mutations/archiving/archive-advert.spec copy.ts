import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvert } from '../../mappers'
import { mutationProps } from '../test-utils/gql-test-definitions'
import { expectAdvertMutationResult } from '../test-utils/expect-advert-mutation-result'

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
  it('updates an advert in the database', () => {
    const advertWasReserved = jest.fn(async () => void 0)
    const notifications = createTestNotificationServices({
      advertWasReserved,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ gqlRequest, adverts, user }) => {
        // eslint-disable-next-line no-param-reassign
        adverts['advert-123'] = {
          ...createEmptyAdvert(),
          id: 'advert-123',
          createdBy: user.id,
        }

        await gqlRequest(archiveAdvertMutation, {
          id: 'advert-123',
        }).then(expectAdvertMutationResult('archiveAdvert'))

        T('should have archive data logged in database', () =>
          expect(adverts['advert-123'].archivedAt).toMatch(/^\d{4}-\d{2}-\d{2}/)
        )
      }
    )
  })
})
