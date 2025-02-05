import type { Filter } from 'mongodb'
import type { MongoAdvert } from '../types'
import type { AdvertWorkflowInput } from '../../../types'
import { combineOr } from './filter-utils'

export const mapWorkflow = (
  workflow?: AdvertWorkflowInput
): Filter<MongoAdvert> | null =>
  combineOr(
    ...[
      ...(workflow?.pickupLocationTrackingNames || [])
        .map(n => n.trim())
        .filter(n => n)
        .map(n => ({
          'workflow.pickupLocationTrackingNames': { $elemMatch: { $eq: n } },
        })),
      ...(workflow?.places || [])
        .map(n => n)
        .filter(n => n)
        .map(n => ({
          'advert.place': { $eq: n },
        })),
    ]
  )
