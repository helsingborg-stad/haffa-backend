import type { FilesService } from '../../../files/types'
import { T, end2endTest } from '../../../test-utils'
import { TxErrors } from '../../../transactions'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertMutationResult, Advert } from '../../types'
import { mutationProps } from '../test-utils/gql-test-definitions'

const removeAdvertMutation = /* GraphQL */ `
mutation Mutation(
	$id: ID!
) {
	removeAdvert(id: $id) {
		${mutationProps}
	}
}
`

describe('removeAdvert', () => {
  it('removes advert', () =>
    end2endTest(
      null,
      async ({ mappedGqlRequest, adverts, user, loginPolicies }) => {
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canRemoveOwnAdverts'],
          },
        ])
        const mockAdvert: Advert = {
          ...createEmptyAdvert(),
          id: 'remove-advert-test-1',
          createdBy: user.id,
        }

        // eslint-disable-next-line no-param-reassign
        adverts['remove-advert-test-1'] = mockAdvert

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'removeAdvert',
          removeAdvertMutation,
          {
            id: 'remove-advert-test-1',
          }
        )
        expect(result.status).toBeNull()
        expect(result.advert).toMatchObject({ id: 'remove-advert-test-1' })

        T('advert has been removed', () =>
          expect(adverts['remove-advert-test-1']).toBeUndefined()
        )
      }
    ))

  it('denies unauthorized attempts', () =>
    end2endTest(null, async ({ mappedGqlRequest, adverts }) => {
      const mockAdvert: Advert = {
        ...createEmptyAdvert(),
        id: 'remove-advert-test-1',
        createdBy: 'someone else',
      }

      // eslint-disable-next-line no-param-reassign
      adverts['remove-advert-test-1'] = mockAdvert

      const result = await mappedGqlRequest<AdvertMutationResult>(
        'removeAdvert',
        removeAdvertMutation,
        {
          id: 'remove-advert-test-1',
        }
      )
      expect(result.status).toMatchObject(TxErrors.Unauthorized)

      T('advert has not been removed', () =>
        expect(adverts['remove-advert-test-1']).toBeDefined()
      )
    }))

  it('removes associated images', () => {
    const mockCleanupFunc = jest.fn()
    const files: FilesService = {
      tryCleanupUrl: mockCleanupFunc,
      tryConvertDataUrlToUrl: async url => url,
      tryCreateApplicationModule: () => null,
    }

    return end2endTest(
      { services: { files } },
      async ({ mappedGqlRequest, user, adverts, loginPolicies }) => {
        await loginPolicies.updateLoginPolicies([
          {
            emailPattern: user.id,
            roles: ['canRemoveOwnAdverts'],
          },
        ])
        const mockAdvert: Advert = {
          ...createEmptyAdvert(),
          id: 'remove-advert-test-1',
          createdBy: user.id,
          images: [
            {
              url: 'image1',
            },
            {
              url: 'image2',
            },
          ],
        }

        // eslint-disable-next-line no-param-reassign
        adverts['remove-advert-test-1'] = mockAdvert

        const result = await mappedGqlRequest<AdvertMutationResult>(
          'removeAdvert',
          removeAdvertMutation,
          {
            id: 'remove-advert-test-1',
          }
        )
        expect(result.status).toBeNull()

        T('removes images from files', () =>
          expect(mockCleanupFunc).toHaveBeenCalledTimes(2)
        )
        T('removes images from files', () =>
          expect(mockCleanupFunc).toHaveBeenNthCalledWith(1, 'image1')
        )
        T('removes images from files', () =>
          expect(mockCleanupFunc).toHaveBeenNthCalledWith(2, 'image2')
        )
      }
    )
  })
})
