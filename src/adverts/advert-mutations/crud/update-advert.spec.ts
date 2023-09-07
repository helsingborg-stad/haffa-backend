import type { FilesService } from '../../../files/types'
import { T, end2endTest } from '../../../test-utils'
import { TxErrors } from '../../../transactions'
import { createEmptyAdvert, createEmptyAdvertInput } from '../../mappers'
import type { Advert, AdvertInput } from '../../types'
import { expectAdvertMutationResult } from '../test-utils/expect-advert-mutation-result'
import { mutationProps } from '../test-utils/gql-test-definitions'

const updateAdvertMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!
	$input: AdvertInput!
) {
	updateAdvert(id: $id, input: $input) {
		${mutationProps}
	}
}
`

describe('updateAdvert', () => {
  it('denies unauthorized attempts', () =>
    end2endTest(null, async ({ gqlRequest, adverts }) => {
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        createdBy: 'someone else',
        id: 'advert-123',
      }

      const input: AdvertInput = createEmptyAdvertInput()
      const result = await gqlRequest(updateAdvertMutation, {
        id: 'advert-123',
        input,
      }).then(expectAdvertMutationResult('updateAdvert', TxErrors.Unauthorized))
      expect(result).toBeTruthy()
    }))

  it('updates an advert in the database', () =>
    end2endTest(null, async ({ gqlRequest, adverts, user }) => {
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        createdBy: user.id,
        id: 'advert-123',
      }

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
      const result = await gqlRequest(updateAdvertMutation, {
        id: 'advert-123',
        input,
      }).then(expectAdvertMutationResult('updateAdvert'))
      T('returned advert should match input', () =>
        expect(result.advert).toMatchObject(input)
      )

      T('database should be updated with input', () =>
        expect(adverts[result?.advert?.id as string]).toMatchObject(input)
      )
      T('database should be updated with input', () =>
        expect(adverts['advert-123']).toMatchObject(input)
      )
    }))
})
