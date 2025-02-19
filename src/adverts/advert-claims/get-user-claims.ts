import type { HaffaUser } from '../../login/types'
import type { AdvertClaim, AdvertClaimType } from '../types'

export const getUserClaims = (
  { claims }: { claims: AdvertClaim[] },
  user: HaffaUser,
  type: AdvertClaimType
): AdvertClaim[] =>
  claims.filter(claim => claim.by === user.id && claim.type === type)
