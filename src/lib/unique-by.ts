import type { Func } from './types'

export const uniqueBy = <T, K>(key: Func<T, K>): Func<T, boolean> => {
  const found = new Set<K>()
  return (item: T) => {
    const k = key(item)
    if (found.has(k)) {
      return false
    }
    found.add(k)
    return true
  }
}
