import type { Filter, Sort } from 'mongodb'
import { AdvertClaimType, AdvertType } from '../../types'
import type { Advert, AdvertFilterInput } from '../../types'
import type { MongoAdvert } from './types'
import type { HaffaUser } from '../../../login/types'
import { mapFields } from './filters/map-fields'
import { mapSearch } from './filters/map-search'
import { mapRestrictions } from './filters/map-restrictions'
import { combineAnd, combineOr } from './filters/filter-utils'
import { uniqueBy } from '../../../lib'
import { mapWorkflow } from './filters/map-workflow'

export const mapAdvertToMongoAdvert = (advert: Advert): MongoAdvert => {
  const isRecycle = advert.type === AdvertType.recycle
  const reservedCount = isRecycle
    ? advert.claims
        .filter(({ type }) => type === AdvertClaimType.reserved)
        .map(({ quantity }) => quantity)
        .reduce((sum, q) => sum + q, 0)
    : 0
  const collectedCount = isRecycle
    ? advert.claims
        .filter(({ type }) => type === AdvertClaimType.collected)
        .map(({ quantity }) => quantity)
        .reduce((sum, q) => sum + q, 0)
    : 0
  const unreservedCount = isRecycle
    ? advert.quantity - reservedCount - collectedCount
    : 0

  const pickupLocationTrackingNames = advert.claims
    // .filter(({ type }) => type === AdvertClaimType.reserved)
    .map(c => c.pickupLocation?.trackingName ?? '')
    .filter(v => v!)
    .filter(uniqueBy(v => v))
  return {
    id: advert.id,
    versionId: advert.versionId,
    advert,
    meta: {
      reservedCount,
      unreservedCount,
      collectedCount,
      archived: !!advert.archivedAt,
    },
    workflow: { pickupLocationTrackingNames },
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
): Filter<MongoAdvert> =>
  combineAnd(
    combineOr(
      combineAnd(
        mapSearch(filter?.search, filter?.pipelineCategoryIds),
        mapFields(filter?.fields)
      ),
      ...(filter?.pipelineOr?.map(({ fields }) => mapFields(fields)) || [])
    ),
    mapRestrictions(user, filter?.restrictions),
    mapWorkflow(filter?.workflow)
  ) || {}
