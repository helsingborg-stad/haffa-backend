import type { Filter } from 'mongodb'
import type { AdvertRestrictionsFilterInput } from '../../../types'
import { AdvertClaimType } from '../../../types'
import type { MongoAdvert } from '../types'
import { combineAnd, combineOr } from './filter-utils'
import type { HaffaUser } from '../../../../login/types'

export const regularAdvertsFilter: Filter<MongoAdvert> = {
  'meta.archived': { $ne: true },
}

const ownerRestrictions = (
  user: HaffaUser,
  restrictions?: AdvertRestrictionsFilterInput
) => {
  // do we use owner/admin restrictions?
  const requiresOwnerAccess = [
    restrictions?.isArchived,
    restrictions?.hasReservations,
    restrictions?.hasCollects,
  ].some(v => v === true || v === false)

  if (requiresOwnerAccess || restrictions?.editableByMe) {
    if (
      restrictions?.editableByMe &&
      user.roles?.canEditOwnAdverts &&
      user.roles.canManageAllAdverts
    ) {
      // super user, no restrictions
      return null
    }
    return { 'advert.createdBy': user.id }
  }
  return null
}

export const mapRestrictions = (
  user: HaffaUser,
  restrictions?: AdvertRestrictionsFilterInput
): Filter<MongoAdvert> | null =>
  combineAnd(
    ownerRestrictions(user, restrictions),
    restrictions?.editableByMe === false && {
      'advert.id': -1, // dont match anything
    },

    restrictions?.canBeReserved === true &&
      combineOr(
        {
          // can be reserved directly
          'meta.unreservedCount': { $gt: 0 },
        },
        {
          // can be reserved when returned
          'advert.lendingPeriod': { $gt: 0 },
        }
      ),
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
    restrictions?.createdByMe === true && {
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
    restrictions?.hasCollects === false && { 'meta.collectedCount': 0 },

    restrictions?.isPicked === true && { 'advert.pickedAt': { $gt: '' } },
    restrictions?.isPicked === false && {
      'advert.pickedAt': { $not: { $gt: '' } },
    }
  )
