const isNullOrUndefined = (v: any) => v === null || typeof v === undefined
const isString = (v: any) => typeof v === 'string'
const isObject = (v: any) => typeof v === 'object'
const isNotNull = <T>(v: T | null): v is T => v !== null

interface Predicate<T> {
  (value: T): boolean
}
const operators: Record<
  string,
  (string: any, value: any) => (obj: any) => boolean
> = {
  eq: (field, v) => o => o[field] === v,
  ne: (field, v) => o => o[field] !== v,
  gt: (field, v) => o => o[field] > v,
  gte: (field, v) => o => o[field] >= v,
  lt: (field, v) => o => o[field] < v,
  lte: (field, v) => o => o[field] <= v,
  in: (field, v) => o =>
    Array.isArray(v)
      ? v.some((e: any) => o[field].includes(e))
      : v.includes(o[field]),
  contains: (field, v) => o =>
    isString(o[field]) && isString(v) && o[field].includes(v),
}
const createAndPredicate = <T>(input: any): Predicate<T> | null => {
  if (!Array.isArray(input)) {
    return null
  }
  const predicates = input
    .map(inner => createFieldFilterPredicate(inner))
    .filter(p => p)
  return value => predicates.every(p => p(value))
}

const createOrPredicate = <T>(input: any): Predicate<T> | null => {
  if (!Array.isArray(input)) {
    return null
  }
  const predicates = input.map(createFieldFilterPredicate).filter(p => p)
  return value => predicates.some(p => p(value))
}

const createNotPredicate = <T>(input: any): Predicate<T> | null => {
  if (!isObject(input)) {
    return null
  }
  const inner = createFieldFilterPredicate(input)
  return value => !inner(value)
}

const combinators: Record<string, (input: any) => Predicate<any> | null> = {
  and: createAndPredicate,
  or: createOrPredicate,
  not: createNotPredicate,
}

const ifSomethingThenStuffItInAnArray = <T>(v: T) => (v ? [v] : null)

export const createFieldFilterPredicate = <T>(input: any): Predicate<T> => {
  if (!input) {
    return () => true
  }

  const predicates: Predicate<T>[] = Object.entries<object>(input)
    .filter(
      ([field, fieldPredicate]) => isString(field) && isObject(fieldPredicate)
    )
    .map(
      ([field, fieldPredicate]) =>
        ifSomethingThenStuffItInAnArray(combinators[field]?.(fieldPredicate)) ||
        Object.entries(fieldPredicate)
          .filter(
            ([operator, value]) =>
              !(isNullOrUndefined(operator) || isNullOrUndefined(value))
          )
          .map(([operator, value]) => operators[operator]?.(field, value))
    )
    .flat()
    .filter(isNotNull)

  return subject => predicates.every(p => p(subject))
}
