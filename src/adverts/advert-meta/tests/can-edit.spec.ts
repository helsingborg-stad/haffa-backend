import { getAdvertMeta } from '..'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'

describe('getAdvertMeta::canEdit', () => {
  const testUser: HaffaUser = { id: 'test@user', roles: [] }
  it('owner can edit', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'test@user' }), testUser)
        .canEdit
    ).toBe(true)
  })
  it('others may not edit', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'another@user' }), testUser)
        .canEdit
    ).toBe(false)
  })
})
