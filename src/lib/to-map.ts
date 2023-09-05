export const toMap = <T, V>(
  list: T[],
  keyFn: (item: T) => string,
  valueFn: (item: T) => V
): Record<string, V> =>
  list.reduce<Record<string, V>>(
    (memo, item) => ({
      ...memo,
      [keyFn(item)]: valueFn(item),
    }),
    {}
  )
