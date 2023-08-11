import { StatusCodes } from 'http-status-codes'
import { T, end2endTest } from '../../test-utils'
import { createEmptyAdvert } from '../mappers'
import { removeAdvertMutation } from './queries'
import type { Advert } from '../types'
import type { FilesService } from '../../files/types'

describe('removeAdvert', () => {
  it('removes advert', () =>
    end2endTest(null, async ({ gqlRequest, adverts, user }) => {
      const mockAdvert: Advert = {
        ...createEmptyAdvert(),
        id: 'remove-advert-test-1',
        createdBy: user.id,
      }

      // eslint-disable-next-line no-param-reassign
      adverts['remove-advert-test-1'] = mockAdvert

      const { status } = await gqlRequest(removeAdvertMutation, {
        id: 'remove-advert-test-1',
      })

      T('REST call returns OK', () => expect(status).toBe(StatusCodes.OK))
      T('advert has been removed', () =>
        expect(adverts['remove-advert-test-1']).toBeUndefined()
      )
    }))

  it('denies unauthorized attempts', () =>
    end2endTest(null, async ({ gqlRequest, adverts }) => {
      const mockAdvert: Advert = {
        ...createEmptyAdvert(),
        id: 'remove-advert-test-1',
        createdBy: 'someone else',
      }

      // eslint-disable-next-line no-param-reassign
      adverts['remove-advert-test-1'] = mockAdvert

      await gqlRequest(removeAdvertMutation, {
        id: 'remove-advert-test-1',
      })

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
      async ({ gqlRequest, adverts }) => {
        const mockAdvert: Advert = {
          ...createEmptyAdvert(),
          id: 'remove-advert-test-1',
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

        await gqlRequest(removeAdvertMutation, {
          id: 'remove-advert-test-1',
        })

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
