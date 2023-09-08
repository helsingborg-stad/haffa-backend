import { getAdvertMeta } from '..'
import { makeAdmin } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import { createEmptyAdvert } from '../../mappers'

describe('getAdvertMeta::canArchive', () => {
  const testUser: HaffaUser = { id: 'test@user', roles: [] }
  it('owner can archive', () => {
    expect(
      getAdvertMeta(createEmptyAdvert({ createdBy: 'test@user' }), testUser)
        .canArchive
    ).toBe(true)
  })
  it('owner can archive unless already archived', () =>
    expect(
      getAdvertMeta(
        createEmptyAdvert({ createdBy: 'test@user', archivedAt: 'now' }),
        testUser
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
      getAdvertMeta(createEmptyAdvert({ createdBy: 'another@user' }), testUser)
        .canArchive
    ).toBe(false)
  })
})
