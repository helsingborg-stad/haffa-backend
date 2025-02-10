import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertClaim } from '../../types'
import { AdvertClaimType, AdvertType } from '../../types'
import { createGetAdvertMeta } from '../advert-meta'

describe('getAdvertMeta::canCollect', () => {
  const getAdvertMeta = createGetAdvertMeta()
  const createUserWithRights = (id: string): HaffaUser => ({
    id,
    roles: { canCollectAdverts: true },
  })

  const createClaim = (defaults?: Partial<AdvertClaim>): AdvertClaim => ({
    by: 'test@user',
    at: new Date().toISOString(),
    quantity: 1,
    type: AdvertClaimType.reserved,
    events: [],
    ...defaults,
  })
  const createReservation = (defaults?: Partial<AdvertClaim>): AdvertClaim =>
    createClaim({ type: AdvertClaimType.reserved, ...defaults })
  const createCollect = (defaults?: Partial<AdvertClaim>): AdvertClaim =>
    createClaim({ type: AdvertClaimType.collected, ...defaults })

  const collectableAdverts = [
    createEmptyAdvert({ quantity: 1 }),
    createEmptyAdvert({
      quantity: 1,
      claims: [createReservation({ quantity: 1 })],
    }),
    createEmptyAdvert({
      quantity: 2,
      claims: [
        createReservation({ quantity: 1 }),
        createReservation({ quantity: 1 }),
      ],
    }),
    createEmptyAdvert({
      quantity: 2,
      claims: [createReservation({ quantity: 1, by: 'someone@else' })],
    }),
    createEmptyAdvert({
      quantity: 2,
      claims: [
        createReservation({ quantity: 1, by: 'someone@else' }),
        createReservation({ quantity: 1 }),
      ],
    }),
  ]

  const uncollctableAdverts = [
    createEmptyAdvert({ quantity: 1, type: AdvertType.borrow }),
    createEmptyAdvert({
      quantity: 1,
      claims: [createReservation({ by: 'someone@else' })],
    }),
    createEmptyAdvert({ quantity: 1, claims: [createCollect()] }),
  ]

  it('allows user with rights', () => {
    collectableAdverts.forEach(advert =>
      expect(
        getAdvertMeta(advert, createUserWithRights('test@user')).canCollect
      ).toBe(true)
    )
  })

  it('denies user without rights', () => {
    collectableAdverts.forEach(advert =>
      expect(getAdvertMeta(advert, { id: 'test@user' }).canCollect).toBe(false)
    )
  })

  it('denies fully collected', () => {
    uncollctableAdverts.forEach(advert =>
      expect(
        getAdvertMeta(advert, createUserWithRights('test@user')).canCollect
      ).toBe(false)
    )
  })
})
