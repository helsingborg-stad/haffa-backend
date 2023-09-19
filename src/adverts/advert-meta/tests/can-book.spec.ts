import { getAdvertMeta } from '..'
import { makeAdmin } from '../../../login'
import { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'
import { AdvertType } from '../../types'

describe('getAdvertMeta::canBook', () => {
  const unbookables = [
    createEmptyAdvert({ quantity: 1, type: AdvertType.recycle }),
    createEmptyAdvert({ quantity: 1, type: AdvertType.borrow }),
    createEmptyAdvert({
      quantity: 1,
      type: AdvertType.recycle,
      createdBy: 'someone@else',
    }),
    createEmptyAdvert({
      quantity: 1,
      type: AdvertType.borrow,
      createdBy: 'someone@else',
    }),
  ]
  it('bookings are never supported', () => {
    unbookables.forEach(advert =>
      expect(
        getAdvertMeta(advert, makeAdmin({ id: 'some@admin' })).canBook
      ).toBe(false)
    )
  })
})
