import type { Filter, Sort } from 'mongodb'
import { AdvertType } from '../types'
import type { Advert, AdvertFilterInput } from '../types'
import type { MongoAdvert } from './types'
import type { HaffaUser } from '../../login/types'
import { mapFields } from './filters/map-fields'
import { mapSearch } from './filters/map-search'
import { mapRestrictions } from './filters/map-restrictions'
import { combineAnd } from './filters/filter-utils'

export const mapAdvertToMongoAdvert = (advert: Advert): MongoAdvert => {
  const isRecycle = advert.type === AdvertType.recycle
  const reservedCount = isRecycle
    ? advert.claims
        .map(({ quantity }) => quantity)
        .reduce((sum, q) => sum + q, 0)
    : 0
  const unreservedCount = isRecycle ? advert.quantity - reservedCount : 0

  return {
    id: advert.id,
    versionId: advert.versionId,
    advert,
    meta: {
      reservedCount,
      unreservedCount,
    },
  }
}

export const mapAdvertFilterInputToMongoSort = (
  filter?: AdvertFilterInput
): Sort => {
  const sort = filter?.sorting?.field
    ? {
        [`advert.${filter.sorting.field}`]: filter?.sorting?.ascending
          ? 'asc'
          : 'desc',
      }
    : {}
  return sort as Sort
}

export const mapAdvertFilterInputToMongoQuery = (
  user: HaffaUser,
  filter?: AdvertFilterInput
): Filter<MongoAdvert> => {
  const queries = [
    mapSearch(filter?.search),
    mapFields(filter?.fields),
    mapRestrictions(user, filter?.restrictions),
  ]

  return combineAnd(queries) || {}
}
