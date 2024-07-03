import type { Filter } from 'mongodb'
import type { MongoAdvert } from '../types'
import { combineOr, escapeRegExp } from './filter-utils'

const srch = (s: string) =>
  s
    ? [
        { 'advert.title': { $regex: escapeRegExp(s), $options: 'i' } },
        { 'advert.description': { $regex: escapeRegExp(s), $options: 'i' } },
        { 'advert.reference': { $regex: escapeRegExp(s), $options: 'i' } },
      ]
    : []

const cat = (categoryIds: string[]) =>
  categoryIds.length
    ? [
        {
          'advert.category': {
            $in: categoryIds,
          },
        },
      ]
    : []

export const mapSearch = (
  search?: string,
  categoryIds?: string[]
): Filter<MongoAdvert> | null | undefined =>
  combineOr(...[...srch((search || '').trim()), ...cat(categoryIds || [])])
