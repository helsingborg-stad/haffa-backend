export interface Predicate<T> {
  (value: T): boolean
}

export interface Func1<T, R> {
  (value: T): R
}

export interface Func2<T1, T2, R> {
  (a: T1, b: T2): R
}
