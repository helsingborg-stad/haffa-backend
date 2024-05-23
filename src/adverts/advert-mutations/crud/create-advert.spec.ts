import {
  T,
  createTestNotificationServices,
  end2endTest,
} from '../../../test-utils'
import { createEmptyAdvertInput } from '../../mappers'
import type { AdvertMutationResult, AdvertInput } from '../../types'
import { mutationProps } from '../test-utils/gql-test-definitions'

const createAdvertMutation = /* GraphQL */ `
mutation Mutation(
	$input: AdvertInput!
) {
	createAdvert(input: $input) {
		${mutationProps}
	}
}
`
describe('createAdvert', () => {
  it('creates an advert in the database and notifies', () => {
    const advertWasCreated = jest.fn(async () => undefined)
    const notifications = createTestNotificationServices({
      advertWasCreated,
    })

    return end2endTest(
      { services: { notifications } },
      async ({ mappedGqlRequest, user, adverts }) => {
        const input: AdvertInput = {
          ...createEmptyAdvertInput(),
          title: 't',
          description: 'd',
          images: [],
          unit: 'u',
          lendingPeriod: 1,
          material: 'm',
          condition: 'c',
          usage: 'u',
          category: 'c',
          externalId: 'eid',
          tags: ['t'],
        }
        const result = await mappedGqlRequest<AdvertMutationResult>(
          'createAdvert',
          createAdvertMutation,
          { input }
        )
        expect(result.status).toBeNull()
        expect(result.advert).toMatchObject(input)

        T('database should be updated with input', () =>
          expect(adverts[result?.advert?.id as string]).toMatchObject(input)
        )

        T('should have notified about the interesting event', () =>
          expect(advertWasCreated).toHaveBeenCalledWith(
            user.id,
            expect.objectContaining(user),
            expect.objectContaining(input)
          )
        )
      }
    )
  })
})
