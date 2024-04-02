import { mapValues, toLookup } from '../../lib'
import type { TxError, TxResult } from '../../transactions'
import type {
  Advert,
  AdvertClaim,
  AdvertMutationResult,
  AdvertMutationStatus,
} from '../types'

export const mapTxErrorToAdvertMutationStatus = (
  error: TxError | null
): AdvertMutationStatus | null =>
  error
    ? {
        code: error.code,
        message: error.message,
        field: error.field || '',
      }
    : null

export const mapTxResultToAdvertMutationResult = (
  result: TxResult<Advert> | null
): AdvertMutationResult =>
  result
    ? {
        advert: result.data,
        status: mapTxErrorToAdvertMutationStatus(result.error),
      }
    : {
        advert: null,
        status: null,
      }
