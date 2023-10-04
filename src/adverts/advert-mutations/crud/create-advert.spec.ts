import { T, end2endTest } from '../../../test-utils'
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
  it('creates an advert in the database', () =>
    end2endTest(null, async ({ mappedGqlRequest, adverts }) => {
      const input: AdvertInput = {
        ...createEmptyAdvertInput(),
        title: 't',
        description: 'd',
        images: [],
        unit: 'u',
        material: 'm',
        condition: 'c',
        usage: 'u',
        category: 'c',
        externalId: 'eid',
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
    }))
})
