import type { Filter } from 'mongodb'
import type { AdvertRestrictionsFilterInput } from '../../../types'
import { AdvertClaimType } from '../../../types'
import type { MongoAdvert } from '../types'
import { combineAnd } from './filter-utils'
import type { HaffaUser } from '../../../../login/types'

export const regularAdvertsFilter: Filter<MongoAdvert> = {
  'meta.archived': { $ne: true },
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
    restrictions?.collectedByMe === true && {
      'advert.claims': {
        $elemMatch: { by: user.id, type: AdvertClaimType.collected },
      },
    },
    restrictions?.collectedByMe === false && {
      $not: {
        'advert.claims': {
          $elemMatch: { by: user.id, type: AdvertClaimType.collected },
        },
      },
    },
    (restrictions?.isArchived ||
      restrictions?.hasReservations ||
      restrictions?.hasCollects ||
      restrictions?.createdByMe === true) && {
      'advert.createdBy': user.id,
    },
    restrictions?.createdByMe === false && {
      'advert.createdBy': { $ne: user.id },
    },
    restrictions?.isArchived ? { 'meta.archived': true } : regularAdvertsFilter,
    restrictions?.hasReservations === true && {
      'meta.reservedCount': { $gt: 0 },
    },
    restrictions?.hasReservations === false && { 'meta.reservedCount': 0 },
    restrictions?.hasCollects === true && { 'meta.collectedCount': { $gt: 0 } },
    restrictions?.hasCollects === false && { 'meta.collectedCount': 0 }
  )
