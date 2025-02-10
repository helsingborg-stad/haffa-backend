import { createGetAdvertMeta } from '..'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'

describe('getAdvertMeta::isOverdue', () => {
  const createUserWithRights = (id: string): HaffaUser => ({
    id,
    roles: {},
  })

  const dates = [
    new Date('2024-01-01').toISOString(),
    new Date('2024-01-02').toISOString(),
    new Date('2024-01-03').toISOString(),
    new Date('2024-01-04').toISOString(),
    new Date('2024-01-05').toISOString(),
  ]
  const now = new Date('2024-01-04')

  const createCollect = (
    at: string,
    defaults: Partial<AdvertClaim> = {}
  ): AdvertClaim => ({
    by: 'test@user',
    at,
    quantity: 1,
    type: AdvertClaimType.collected,
    events: [],
    ...defaults,
  })

  const createReserved = (
    at: string,
    defaults: Partial<AdvertClaim> = {}
  ): AdvertClaim => ({
    by: 'test@user',
    at,
    quantity: 1,
    type: AdvertClaimType.reserved,
    events: [],
    ...defaults,
  })

  const advertsWithCollectedClaims = [
    createEmptyAdvert({
      lendingPeriod: 0,
      quantity: 1,
      claims: dates.map(date => createCollect(date)),
    }),
    createEmptyAdvert({
      lendingPeriod: 1,
      quantity: 1,
      claims: dates.map(date => createCollect(date)),
    }),
    createEmptyAdvert({
      lendingPeriod: 2,
      quantity: 1,
      claims: dates.map(date => createCollect(date)),
    }),
    createEmptyAdvert({
      lendingPeriod: 3,
      quantity: 1,
      claims: dates.map(date => createCollect(date)),
    }),
    createEmptyAdvert({
      lendingPeriod: 4,
      quantity: 1,
      claims: dates.map(date => createCollect(date)),
    }),
  ]
  const advertsWithReservedClaims = [
    createEmptyAdvert({
      lendingPeriod: 0,
      quantity: 1,
      claims: dates.map(date => createReserved(date)),
    }),
    createEmptyAdvert({
      lendingPeriod: 1,
      quantity: 1,
      claims: dates.map(date => createReserved(date)),
    }),
    createEmptyAdvert({
      lendingPeriod: 2,
      quantity: 1,
      claims: dates.map(date => createReserved(date)),
    }),
  ]

  const getAdvertMeta = createGetAdvertMeta()

  it('should not report overdue when lendingPeriod is 0', () => {
    const meta = getAdvertMeta(
      advertsWithCollectedClaims[0],
      createUserWithRights('test@user'),
      now
    )
    expect(meta.claims.filter(claim => claim.isOverdue)).toHaveLength(0)
  })

  it('should have 2 overdue claim(s) (LendingPeriod 1 days)', () => {
    const meta = getAdvertMeta(
      advertsWithCollectedClaims[1],
      createUserWithRights('test@user'),
      now
    )
    expect(meta.claims.filter(claim => claim.isOverdue)).toHaveLength(2)
  })
  it('should have 1 overdue claim(s) (LendingPeriod 2 days)', () => {
    const meta = getAdvertMeta(
      advertsWithCollectedClaims[2],
      createUserWithRights('test@user'),
      now
    )
    expect(meta.claims.filter(claim => claim.isOverdue)).toHaveLength(1)
  })
  it('should have 0 overdue claim(s) (LendingPeriod 3 days)', () => {
    const meta = getAdvertMeta(
      advertsWithCollectedClaims[3],
      createUserWithRights('test@user'),
      now
    )
    expect(meta.claims.filter(claim => claim.isOverdue)).toHaveLength(0)
  })
  it('should have 0 overdue claim(s) (LendingPeriod 4 days)', () => {
    const meta = getAdvertMeta(
      advertsWithCollectedClaims[4],
      createUserWithRights('test@user'),
      now
    )
    expect(meta.claims.filter(claim => claim.isOverdue)).toHaveLength(0)
  })
  it('should never have overdue claim(s) when status is reserved', () => {
    const meta0 = getAdvertMeta(
      advertsWithReservedClaims[0],
      createUserWithRights('test@user'),
      now
    )
    expect(meta0.claims.filter(claim => claim.isOverdue)).toHaveLength(0)

    const meta1 = getAdvertMeta(
      advertsWithReservedClaims[1],
      createUserWithRights('test@user'),
      now
    )
    expect(meta1.claims.filter(claim => claim.isOverdue)).toHaveLength(0)
    const meta2 = getAdvertMeta(
      advertsWithReservedClaims[2],
      createUserWithRights('test@user'),
      now
    )
    expect(meta2.claims.filter(claim => claim.isOverdue)).toHaveLength(0)
  })
})
