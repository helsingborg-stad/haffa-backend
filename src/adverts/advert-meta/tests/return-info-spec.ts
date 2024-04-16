import { getAdvertMeta } from '..'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'
import type { AdvertClaim } from '../../types'
import { AdvertClaimType } from '../../types'

const haffaUser: HaffaUser = {
  id: 'test@user.se',
  roles: { canCollectAdverts: true },
}

describe('getAdvertMeta::returnInfo', () => {
  const createClaim = (defaults?: Partial<AdvertClaim>): AdvertClaim => ({
    by: 'test@user',
    at: 'new Date().toISOString()',
    quantity: 1,
    type: AdvertClaimType.collected,
    events: [],
    ...defaults,
  })

  it('sorts bookings in correct order', () => {
    const advert = createEmptyAdvert({
      lendingPeriod: 10,
      quantity: 0,
      claims: [
        createClaim({ at: '2024-01-05', quantity: 1 }),
        createClaim({ at: '2024-01-01', quantity: 2 }),
      ],
    })
    const meta = getAdvertMeta(advert, haffaUser)

    expect(meta.returnInfo).toStrictEqual([
      { at: '2024-01-11T00:00:00.000Z', quantity: 2 },
      { at: '2024-01-15T00:00:00.000Z', quantity: 1 },
    ])
  })
  it('ignores claims of type reservation', () => {
    const advert = createEmptyAdvert({
      lendingPeriod: 10,
      quantity: 0,
      claims: [
        createClaim({ at: '2024-01-05' }),
        createClaim({ at: '2024-01-06', type: AdvertClaimType.reserved }),
      ],
    })
    const meta = getAdvertMeta(advert, haffaUser)

    expect(meta.returnInfo).toHaveLength(1)
  })
})
