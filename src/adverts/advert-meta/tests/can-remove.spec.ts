import { getAdvertMeta } from '..'
import { makeAdmin } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'

describe('getAdvertMeta::canRemove', () => {
  const testUser: HaffaUser = { id: 'test@user', roles: [] }
  it('admin can remove', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user' }),
        makeAdmin(testUser)
      ).canRemove
    ).toBe(true)
  })
  it('owner may not remove', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'another@user' }), testUser)
        .canRemove
    ).toBe(false)
  })

  it('others may not remove', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'another@user' }), testUser)
        .canRemove
    ).toBe(false)
  })
})
