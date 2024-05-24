import type { Func } from './types'

export const exceptValues = <T, V>(
  values: V[],
  mapValue: Func<T, V>
): Func<T, boolean> => {
  const s = new Set<V>(values)
  return (item: T) => {
    if (s.has(mapValue(item))) {
      return false
    }
    return true
  }
}
