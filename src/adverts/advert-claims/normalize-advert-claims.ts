import { mapValues, sortBy, toLookup } from '../../lib'
import type { AdvertClaim } from '../types'
import { AdvertClaimType } from '../types'

const max = <T>(a: T, b: T): T => (b > a ? b : a)

const stripQuantityZero = (claims: AdvertClaim[]) =>
  claims.filter(({ quantity }) => quantity > 0)

export const normalizeAdvertClaims = (claims: AdvertClaim[]): AdvertClaim[] => {
  const groups =
    // group by (to,by, type)
    toLookup(stripQuantityZero(claims), ({ by, type }) => `${type}:${by}`)

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

  return Object.values(combined).sort(sortBy(({ at }) => at))
}
