export const toLookup = <T>(
  list: T[],
  keyFn: (item: T) => string
): Record<string, T[]> =>
  list.reduce<Record<string, T[]>>((lookup, item) => {
    const k = keyFn(item)
    lookup[k] ||= []
    const l = lookup[k]
    l.push(item)
    return lookup
  }, {})
