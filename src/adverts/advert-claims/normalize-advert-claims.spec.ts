import type { AdvertClaim } from '../types'
import { AdvertClaimType } from '../types'
import { normalizeAdvertClaims } from './normalize-advert-claims'

const makeClaim = (c: Partial<AdvertClaim>): AdvertClaim => ({
  quantity: 1,
  by: '',
  at: '',
  type: AdvertClaimType.collected,
  events: [],
  ...c,
})

const reserved = (c: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.reserved, ...c })
const collected = (c: Partial<AdvertClaim>) =>
  makeClaim({ type: AdvertClaimType.collected, ...c })

describe('normalizeAdvertClaims', () => {
  const testGroupingByType = (make: typeof makeClaim) => {
    const n = normalizeAdvertClaims([
      make({
        by: 'me',
        at: '2020-01-01',
        quantity: 1,
      }),
      make({
        by: 'you',
        at: '2020-02-02',
        quantity: 2,
      }),
      make({
        by: 'me',
        at: '2020-03-03',
        quantity: 3,
      }),
    ])
    expect(n).toMatchObject([
      make({
        by: 'you',
        at: '2020-02-02',
        quantity: 2,
      }),
      make({
        by: 'me',
        at: '2020-03-03',
        quantity: 4,
      }),
    ])
  }
  it('removes claims with zero quantity', () => {
    const n = normalizeAdvertClaims([
      reserved({ by: 'a', at: '2021-01-01', quantity: 0 }),
      collected({ by: 'b', at: '2022-02-02', quantity: 0 }),
    ])
    expect(n).toHaveLength(0)
  })

  it('sort claims by date', () => {
    const n = normalizeAdvertClaims([
      reserved({ by: 'a', at: '2023-03-03' }),
      collected({ by: 'b', at: '2022-02-02' }),
    ])
    expect(n).toMatchObject([
      collected({ by: 'b', at: '2022-02-02' }),
      reserved({ by: 'a', at: '2023-03-03' }),
    ])
  })

  it('groups reservations by user', () => testGroupingByType(reserved))
  it('groups collects by user', () => testGroupingByType(collected))

  it('groups by owner and type', () => {
    const at = new Date().toISOString()
    expect(
      normalizeAdvertClaims([
        reserved({ by: 'a', quantity: 2, at }),
        collected({ by: 'a', at }),
        reserved({ by: 'b', at }),
        reserved({ by: 'a', quantity: 3, at }),
      ])
    ).toMatchObject([
      reserved({ by: 'a', quantity: 5, at }),
      collected({ by: 'a', at }),
      reserved({ by: 'b', at }),
    ])
  })
})
