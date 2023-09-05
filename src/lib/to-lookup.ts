export const toLookup = <T>(
  list: T[],
  keyFn: (item: T) => string
): Record<string, T[]> =>
  list.reduce<Record<string, T[]>>((lookup, item) => {
    const k = keyFn(item)
    // eslint-disable-next-line no-param-reassign
    const l = lookup[k] || (lookup[k] = [])
    l.push(item)
    return lookup
  }, {})
