import { getAdvertMeta } from '..'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'

describe('getAdvertMeta::canEdit', () => {
  const createUserWithRights = (id: string): HaffaUser => ({
    id,
    roles: { canEditOwnAdverts: true },
  })

  it('owner with rights can edit', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user' }),
        createUserWithRights('test@user')
      ).canEdit
    ).toBe(true)
  })

  it('owner without rights can not edit', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'test@user' }), {
        id: 'test@user',
      }).canEdit
    ).toBe(false)
  })

  it('others may not edit', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user' }),
        createUserWithRights('another@user')
      ).canEdit
    ).toBe(false)
  })
})
