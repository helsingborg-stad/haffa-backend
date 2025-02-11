import type { Filter } from 'mongodb'
import type { MongoAdvert } from '../types'
import type { AdvertWorkflowInput } from '../../../types'
import { combineAnd } from './filter-utils'
import { uniqueBy } from '../../../../lib'

const mapPickuplocationTrackingNames = (names?: string[]) =>
  names && names.length > 0
    ? {
        'workflow.pickupLocationTrackingNames': { $elemMatch: { $in: names } },
      }
    : null
const mapPlaces = (places?: string[]) =>
  places && places.length > 0
    ? {
        'advert.place': { $in: places },
      }
    : null

const sanitizeStrings = (l?: string[]) =>
  l?.filter(v => v).filter(uniqueBy(v => v))

export const mapWorkflow = (
  workflow?: AdvertWorkflowInput
): Filter<MongoAdvert> | null =>
  combineAnd(
    mapPickuplocationTrackingNames(
      sanitizeStrings(workflow?.pickupLocationTrackingNames)
    ),
    mapPlaces(sanitizeStrings(workflow?.places))
  )
