import { getAdvertMeta } from '..'
import { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'

describe('getAdvertMeta::canRemove', () => {
  const testUser: HaffaUser = { id: 'test@user', roles: [] }
  it('owner can remove', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'test@user' }), testUser)
        .canRemove
    ).toBe(true)
  })
  it('others may not remove', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'another@user' }), testUser)
        .canRemove
    ).toBe(false)
  })
})
