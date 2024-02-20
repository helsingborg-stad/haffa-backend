import type { Filter } from 'mongodb'
import type { HaffaUser } from '../../../../login/types'
import type { MongoAdvert } from '../types'
import { combineAnd } from './filter-utils'
import { mapRestrictions, regularAdvertsFilter } from './map-restrictions'

describe('mapRestrictions', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user: HaffaUser = {
    id: 'test@user',
  }

  const makeRegularFilter = (
    filter: Filter<MongoAdvert>
  ): Filter<MongoAdvert> => combineAnd(filter, regularAdvertsFilter)!

  it('maps empty or not set to list regular (non archived) adverts', () => {
    expect(mapRestrictions(user)).toMatchObject(regularAdvertsFilter)
    expect(mapRestrictions(user, undefined)).toMatchObject(regularAdvertsFilter)
    expect(mapRestrictions(user, {})).toMatchObject(regularAdvertsFilter)
  })

  it('maps canBeReserved', () => {
    expect(mapRestrictions(user, { canBeReserved: true })).toMatchObject(
      makeRegularFilter({
        $or: [
          {
            'meta.unreservedCount': { $gt: 0 },
          },
          { 'advert.lendingPeriod': { $gt: 0 } },
        ],
      })
    )

    expect(mapRestrictions(user, { canBeReserved: false })).toMatchObject(
      makeRegularFilter({
        'meta.unreservedCount': 0,
      })
    )
  })

  it('maps createByMe', () => {
    expect(mapRestrictions(user, { createdByMe: true })).toMatchObject(
      makeRegularFilter({
        'advert.createdBy': user.id,
      })
    )
    expect(mapRestrictions(user, { createdByMe: false })).toMatchObject(
      makeRegularFilter({
        'advert.createdBy': { $ne: user.id },
      })
    )
  })
})
