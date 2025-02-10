import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'
import { createGetAdvertMeta } from '../advert-meta'

const haffaUser: HaffaUser = {
  id: 'test@user.se',
  roles: { canCollectAdverts: true },
}

describe('getAdvertMeta::canBook', () => {
  const getAdvertMeta = createGetAdvertMeta()
  it('cannot be booked if lending period is zero', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({
          lendingPeriod: 0,
          quantity: 1,
          createdBy: 'someone@else',
        }),
        haffaUser
      ).canBook
    ).toBe(false)
  })
  it('cannot be booked if quantity is zero', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({
          lendingPeriod: 5,
          quantity: 0,
          createdBy: 'someone@else',
        }),
        haffaUser
      ).canBook
    ).toBe(false)
  })
  it('can be booked if quantity is more than zero and lending period is set', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({
          lendingPeriod: 5,
          quantity: 1,
          createdBy: 'someone@else',
        }),
        haffaUser
      ).canBook
    ).toBe(true)
  })
})
