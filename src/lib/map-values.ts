export const mapValues = <V, U>(
  obj: Record<string, V>,
  valueFn: (value: V) => U
): Record<string, U> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, valueFn(v)]))
