import type { Filter } from 'mongodb'
import type { AdvertRestrictionsFilterInput } from '../../types'
import { AdvertClaimType } from '../../types'
import type { MongoAdvert } from '../types'
import { combineAnd } from './filter-utils'
import type { HaffaUser } from '../../../login/types'

export const regularAdvertsFilter: Filter<MongoAdvert> = {
  'meta.archived': { $not: { $eq: true } },
}

export const mapRestrictions = (
  user: HaffaUser,
  restrictions?: AdvertRestrictionsFilterInput
): Filter<MongoAdvert> | null =>
  combineAnd(
    restrictions?.canBeReserved === true && {
      'meta.unreservedCount': { $gt: 0 },
    },
    restrictions?.canBeReserved === false && { 'meta.unreservedCount': 0 },
    restrictions?.reservedByMe === true && {
      'advert.claims': {
        $elemMatch: { by: user.id, type: AdvertClaimType.reserved },
      },
    },
    restrictions?.reservedByMe === false && {
      $not: {
        'advert.claims': {
          $elemMatch: { by: user.id, type: AdvertClaimType.reserved },
        },
      },
    },
    (restrictions?.isArchived || restrictions?.createdByMe === true) && {
      'advert.createdBy': user.id,
    },
    restrictions?.createdByMe === false && {
      'advert.createdBy': { $ne: user.id },
    },
    restrictions?.isArchived
      ? { 'meta.archived': { $eq: true } }
      : regularAdvertsFilter
  )
