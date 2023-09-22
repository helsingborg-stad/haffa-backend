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

export const normalizeAdvertClaims = (claims: AdvertClaim[]): AdvertClaim[] => {
  const keyOfClaim = ({ by, type }: AdvertClaim) => `${type}:${by}`

  const groups = toLookup(
    claims.filter(c => c.quantity > 0),
    keyOfClaim
  )

  const max = <T>(a: T, b: T): T => (b > a ? b : a)

  const combined = mapValues<AdvertClaim[], AdvertClaim>(groups, group =>
    group.slice(1).reduce(
      (agg, c) => ({
        ...c,
        at: max(agg.at, c.at),
        quantity: agg.quantity + c.quantity,
      }),
      group[0]
    )
  )

  return Object.values(combined).sort(({ at: a }, { at: b }) =>
    // eslint-disable-next-line no-nested-ternary
    a > b ? 1 : a < b ? -1 : 0
  )
}
