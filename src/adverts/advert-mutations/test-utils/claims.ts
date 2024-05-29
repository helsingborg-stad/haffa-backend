import type { AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'

export const makeClaim = (c?: Partial<AdvertClaim>): AdvertClaim => ({
  quantity: 1,
  by: '',
  at: new Date().toISOString(),
  type: AdvertClaimType.collected,
  events: [],
  ...c,
})
export const makeReservedClaim = (c?: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.reserved, ...c })
export const makeCollectClaim = (c?: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.collected, ...c })
