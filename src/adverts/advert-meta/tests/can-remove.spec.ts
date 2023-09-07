import { getAdvertMeta } from '..'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'

const makeAdmin = (u: HaffaUser): HaffaUser => ({
  ...u,
  roles: ['admin'],
})

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
