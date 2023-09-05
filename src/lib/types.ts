// Given a type T, return union of all property names with values of type U
export type OfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}

// Subset of type T with properties of type U
export type Only<T, U> = Pick<T, OfType<T, U>[keyof T]>
