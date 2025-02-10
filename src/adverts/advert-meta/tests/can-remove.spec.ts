import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'
import { createGetAdvertMeta } from '../advert-meta'

describe('getAdvertMeta::canRemove', () => {
  const getAdvertMeta = createGetAdvertMeta()

  const createUserWithRights = (id: string): HaffaUser => ({
    id,
    roles: { canRemoveOwnAdverts: true },
  })

  it('with rights can remove own', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user' }),
        createUserWithRights('test@user')
      ).canRemove
    ).toBe(true)
  })
  it('without rights can not remove', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'test@user' }), {
        id: 'test@user',
      }).canRemove
    ).toBe(false)
  })

  it('others may not remove', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user' }),
        createUserWithRights('another@user')
      ).canRemove
    ).toBe(false)
  })
})
