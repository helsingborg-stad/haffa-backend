import type { AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'

export const makeClaim = (c?: Partial<AdvertClaim>): AdvertClaim => ({
  quantity: 1,
  by: '',
  at: '',
  type: AdvertClaimType.collected,
  events: [],
  ...c,
})
export const makeReservedClaim = (c?: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.reserved, ...c })
