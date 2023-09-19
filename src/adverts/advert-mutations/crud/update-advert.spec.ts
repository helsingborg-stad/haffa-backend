import { T, end2endTest } from '../../../test-utils'
import { TxErrors } from '../../../transactions'
import { createEmptyAdvert, createEmptyAdvertInput } from '../../mappers'
import type { AdvertInput, AdvertMutationResult } from '../../types'
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
    end2endTest(null, async ({ mappedGqlRequest, adverts }) => {
      adverts['advert-123'] = {
        ...createEmptyAdvert(),
        createdBy: 'someone else',
        id: 'advert-123',
      }

      const input: AdvertInput = createEmptyAdvertInput()
      const result = await mappedGqlRequest<AdvertMutationResult>(
        'updateAdvert',
        updateAdvertMutation,
        {
          id: 'advert-123',
          input,
        }
      )
      expect(result.status).toMatchObject(TxErrors.Unauthorized)
    }))

  it('updates an advert in the database', () =>
    end2endTest(
      null,
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        // give us rights to handle edits
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: {
              canEditOwnAdverts: true,
            },
          },
        ])

        // eslint-disable-next-line no-param-reassign
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
        const result = await mappedGqlRequest<AdvertMutationResult>(
          'updateAdvert',
          updateAdvertMutation,
          {
            id: 'advert-123',
            input,
          }
        )
        expect(result.status).toBeNull()
        T('returned advert should match input', () =>
          expect(result.advert).toMatchObject(input)
        )

        T('database should be updated with input', () =>
          expect(adverts[result?.advert?.id as string]).toMatchObject(input)
        )
        T('database should be updated with input', () =>
          expect(adverts['advert-123']).toMatchObject(input)
        )
      }
    ))
})
