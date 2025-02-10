import type { Func } from './types'

export const byCommonTags = <T>(
  items: T[],
  getTags: Func<T, string[]>
): Func<string[], T[]> => {
  if (items.length === 0) {
    return () => []
  }
  const l = items
    .map(item => ({
      item,
      tags: new Set(getTags(item)),
    }))
    .filter(({ tags }) => tags.size > 0)

  if (l.length === 0) {
    return () => []
  }
  return matchTags =>
    matchTags.length > 0
      ? l
          .filter(({ tags }) => matchTags.some(t => tags.has(t)))
          .map(({ item }) => item)
      : []
}
