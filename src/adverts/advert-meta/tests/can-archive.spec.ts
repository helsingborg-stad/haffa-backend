import { createGetAdvertMeta } from '..'
import { makeAdmin } from '../../../login'
import type { HaffaUser } from '../../../login/types'
import {
  makeCollectClaim,
  makeReservedClaim,
} from '../../advert-mutations/test-utils/claims'
import { createEmptyAdvert } from '../../mappers'

describe('getAdvertMeta::canArchive', () => {
  const getAdvertMeta = createGetAdvertMeta()
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

  it('can not be archived when reserved', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({
          createdBy: 'test@user',
          quantity: 10,
          claims: [makeReservedClaim({ by: 'someone' })],
        }),
        makeAdmin({ id: 'some@admin' })
      ).canArchive
    ).toBe(false)
  })

  it('can not be archived when borrowed', () => {
    expect(
      getAdvertMeta(
        createEmptyAdvert({
          createdBy: 'test@user',
          quantity: 10,
          lendingPeriod: 10,
          claims: [makeCollectClaim({ by: 'someone' })],
        }),
        makeAdmin({ id: 'some@admin' })
      ).canArchive
    ).toBe(false)
  })
})
