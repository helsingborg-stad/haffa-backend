import { getAdvertMeta } from '..'
import { makeAdmin } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'

describe('getAdvertMeta::canArchive', () => {
  const createUserWithRights = (id: string): HaffaUser => ({
    id,
    roles: { canArchiveOwnAdverts: true },
  })
  it('owner with rights can archive', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user' }),
        createUserWithRights('test@user')
      ).canArchive
    ).toBe(true)
  })
  it('owner with rights can archive unless already archived', () =>
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user', archivedAt: 'now' }),
        createUserWithRights('test@user')
      ).canArchive
    ).toBe(false))

  it('admin can archive', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user' }),
        makeAdmin({ id: 'some@admin' })
      ).canArchive
    ).toBe(true)
  })

  it('admin can archive unless already archived', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user', archivedAt: 'now' }),
        makeAdmin({ id: 'some@admin' })
      ).canArchive
    ).toBe(false)
  })

  it('others may not archive', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user' }),
        createUserWithRights('another@user')
      ).canArchive
    ).toBe(false)
  })
})
