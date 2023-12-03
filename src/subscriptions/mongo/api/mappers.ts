import { createHash } from 'crypto'
import type { HaffaUser } from '../../../login/types'
import type { AdvertSubscriptionFilter } from '../../types'

export const sanitizeAdvertSubscriptionFilter = (
  filter: AdvertSubscriptionFilter
): AdvertSubscriptionFilter => ({
  search: filter.search?.trim(),
  categories: filter.categories?.map(c => c.trim()).filter(c => c),
  tags: filter.tags?.map(c => c.trim()).filter(c => c),
})

export const tryCreateSubscriptionHash = (
  user: HaffaUser,
  filter: AdvertSubscriptionFilter
): string | null => {
  const keyParts = [
    user.id,
    filter.search,
    ...(filter.categories || []),
    ...(filter.tags || []),
  ]
    .map(v => v?.trim() || '')
    .filter(v => v)
    // eslint-disable-next-line no-nested-ternary
    .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0))

  if (keyParts.length < 2) {
    return null
  }
  return createHash('sha256').update(keyParts.join('@')).digest('hex')
}
