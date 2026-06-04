export type Predicate<T> = (value: T) => boolean

export type Func1<T, R> = (value: T) => R

export type Func2<T1, T2, R> = (a: T1, b: T2) => R
