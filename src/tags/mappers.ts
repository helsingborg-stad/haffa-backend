import { uniqueBy } from '../lib'
import type { TagDescription } from './types'

const isString = (v: any) => typeof v === 'string'
const isStringOrUndefined = (v: any) =>
  typeof v === 'string' || typeof v === 'undefined'

const empty: TagDescription = { tag: '', label: '', description: '' }

// In ancient times, tags descriptions were stored as options as (tag, description) pairs
const tryMigrateFromLegacyOptionsFormat = (v: any): TagDescription | null =>
  isString(v?.key) && isString(v?.value)
    ? {
        tag: v.key,
        label: '',
        description: v.value,
      }
    : null

const tryNormalizeTagDescription = (
  d?: Partial<TagDescription>
): TagDescription | null =>
  d &&
  isString(d.tag) &&
  isStringOrUndefined(d.label) &&
  isStringOrUndefined(d.description)
    ? {
        tag: d.tag?.trim() || '',
        label: d.label?.trim() || '',
        description: d.description?.trim() || '',
      }
    : null

export const normalizeTagDescriptions = (
  descriptions: Partial<TagDescription>[] | null
): TagDescription[] =>
  (descriptions || [])
    .map(
      d =>
        tryMigrateFromLegacyOptionsFormat(d) ||
        tryNormalizeTagDescription(d) ||
        empty
    )
    .filter(d => d.tag && (d.label || d.description))
    .filter(uniqueBy(d => d?.tag))
