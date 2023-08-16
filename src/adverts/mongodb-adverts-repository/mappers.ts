import type { Filter, Sort } from 'mongodb'
import { AdvertClaimType, AdvertType } from '../types'
import type {
  AdvertRestrictionsFilterInput,
  Advert,
  AdvertFilterInput,
} from '../types'
import type { MongoAdvert } from './types'
import type { HaffaUser } from '../../login/types'

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
  const combineAnd = (
    queries: (Filter<MongoAdvert> | null | undefined)[]
  ): Filter<MongoAdvert> | null => {
    const [first, second, ...tail] = queries.filter(v => v)
    return first && second
      ? { $and: [first, second, ...(tail as Filter<MongoAdvert>[])] }
      : first || null
  }

  const mapSearch = (search?: string): Filter<MongoAdvert> | null | undefined =>
    [search]
      .map(s => (s || '').trim())
      .filter(s => s)
      .map(s => ({ $text: { $search: s, $caseSensitive: false  } }))[0] || null

  const mapRestrictions = (
    restrictions?: AdvertRestrictionsFilterInput
  ): Filter<MongoAdvert> | null =>
    combineAnd(
      [
        restrictions?.canBeReserved === true && {
          'meta.unreservedCount': { $gt: 0 },
        },
        restrictions?.canBeReserved === false && { 'meta.unreservedCount': 0 },
        restrictions?.reservedByMe === true && {
          'advert.claims': { $elemMatch: { by: user.id, type: AdvertClaimType.reserved } },
        },
        restrictions?.reservedByMe === false && {
          $not: {
            'advert.claims': { $elemMatch: { by: user.id, type: AdvertClaimType.reserved } },
          },
        },
        restrictions?.createdByMe === true && { 'advert.createdBy': user.id },
        restrictions?.createdByMe === false && {
          'advert.createdBy': { $ne: user.id },
        },
      ].map(v => v as Filter<MongoAdvert>)
    )

  const queries = [
    mapSearch(filter?.search),
    mapRestrictions(filter?.restrictions),
  ]

  return combineAnd(queries) || {}
}
