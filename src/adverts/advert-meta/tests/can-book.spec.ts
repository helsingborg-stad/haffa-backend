import { getAdvertMeta } from '..'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'

const haffaUser: HaffaUser = {
  id: 'test@user.se',
  roles: { canCollectAdverts: true },
}

describe('getAdvertMeta::canBook', () => {
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
