/* eslint-disable jest/no-standalone-expect */
import { StatusCodes } from 'http-status-codes'
import type { AdvertMutationResult } from '../../types'
import { T } from '../../../test-utils'
import type { TxError } from '../../../transactions'

export const expectAdvertMutationResult =
  (name: string, expectedError?: TxError) =>
  ({ status, body }: { status: any; body: any }): AdvertMutationResult => {
    T('REST call should succeed', () => expect(status).toBe(StatusCodes.OK))

    T('GQL should not give errors', () =>
      expect(body?.data?.errors).toBeFalsy()
    )

    const r = body?.data?.[name] as AdvertMutationResult
    T('GQL should give AdvertMutationResult', () => expect(r).not.toBeFalsy())

    if (expectedError) {
      T('Status should be set', () =>
        expect(r.status).toMatchObject(expectedError)
      )
    } else {
      T('Status should be null', () => expect(r.status).toBeNull())
    }
    return r
  }
