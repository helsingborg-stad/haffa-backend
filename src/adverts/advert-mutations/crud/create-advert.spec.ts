import { T, end2endTest } from '../../../test-utils'
import { createEmptyAdvertInput } from '../../mappers'
import type { AdvertInput } from '../../types'
import { expectAdvertMutationResult } from '../test-utils/expect-advert-mutation-result'
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
    end2endTest(null, async ({ gqlRequest, adverts }) => {
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
      const result = await gqlRequest(createAdvertMutation, { input }).then(
        expectAdvertMutationResult('createAdvert')
      )

      T('gql result should match input', () =>
        expect(result?.advert).toMatchObject(input)
      )

      T('database should be updated with input', () =>
        expect(adverts[result?.advert?.id as string]).toMatchObject(input)
      )
    }))
})
