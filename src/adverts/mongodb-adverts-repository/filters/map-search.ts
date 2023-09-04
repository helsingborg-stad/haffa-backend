import type { Filter } from 'mongodb'
import type { MongoAdvert } from '../types'
import { escapeRegExp } from './filter-utils'

export const mapSearch = (
  search?: string
): Filter<MongoAdvert> | null | undefined =>
  [search]
    .map(s => (s || '').trim())
    .filter(s => s)
    .map(s => ({
      $or: [
        { 'advert.title': { $regex: escapeRegExp(s), $options: 'i' } },
        { 'advert.description': { $regex: escapeRegExp(s), $options: 'i' } },
      ],
    }))[0] || null
