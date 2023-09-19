import { getAdvertMeta } from '..'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertClaim } from '../../types'
import { AdvertClaimType, AdvertType } from '../../types'

describe('getAdvertMeta::canReserve', () => {
  const testUser: HaffaUser = { id: 'test@user' }
  const createUserWithRights = (id: string): HaffaUser => ({
    id,
    roles: { canReserveAdverts: true },
  })

  const createReservation = (defaults?: Partial<AdvertClaim>): AdvertClaim => ({
    by: 'test@user',
    at: new Date().toISOString(),
    quantity: 1,
    type: AdvertClaimType.reserved,
    ...defaults,
  })

  const reservableAdverts = [
    createEmptyAdvert({ quantity: 1 }),
    createEmptyAdvert({
      quantity: 2,
      claims: [createReservation({ quantity: 1 })],
    }),
    createEmptyAdvert({
      quantity: 10,
      claims: [createReservation({ quantity: 9 })],
    }),
  ]

  const unreservableAdverts = [
    createEmptyAdvert({ quantity: 1, type: AdvertType.borrow }),
    createEmptyAdvert({
      quantity: 2,
      claims: [createReservation({ quantity: 2 })],
    }),
    createEmptyAdvert({
      quantity: 10,
      claims: [
        createReservation({ quantity: 9 }),
        createReservation({ quantity: 1 }),
      ],
    }),
  ]

  it('allows reservations if advert.quantity exceeds total reservations', () => {
    reservableAdverts.forEach(advert =>
      expect(
        getAdvertMeta(advert, createUserWithRights('test@user')).canReserve
      ).toBe(true)
    )
  })

  it('denies reservations if rights are missing', () => {
    reservableAdverts.forEach(advert =>
      expect(getAdvertMeta(advert, { id: 'test@user' }).canReserve).toBe(false)
    )
  })

  it('denies reservations if total reservations amounts ot advert.quantity', () => {
    unreservableAdverts.forEach(advert =>
      expect(
        getAdvertMeta(advert, createUserWithRights('test@user')).canReserve
      ).toBe(false)
    )
  })
})
