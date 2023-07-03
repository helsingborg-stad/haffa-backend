import { StatusCodes } from 'http-status-codes'
import { end2endTest } from '../../test-utils'
import { createAdvertMutation } from './queries'
import type { AdvertInput } from '../types'

describe('createAdvert', () => {
  it('xxx', () =>
    end2endTest(async ({ gqlRequest }) => {
      const input: AdvertInput = {
        title: 't',
        description: 'd',
        images: [],
        quantity: 0,
        unit: 'u',
        material: 'm',
        condition: 'c',
        usage: 'u',
      }
      const { status, body } = await gqlRequest(createAdvertMutation, { input })
      expect(status).toBe(StatusCodes.OK)

      expect(body?.data?.createAdvert).toMatchObject(input)
    }))
})
