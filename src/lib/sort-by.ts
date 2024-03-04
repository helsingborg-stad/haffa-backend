export const sortBy =
  <T>(key: (item: T) => string | number): ((a: T, b: T) => number) =>
  (a, b) => {
    const ka = key(a)
    const kb = key(b)
    if (ka > kb) {
      return 1
    }
    if (ka < kb) {
      return -1
    }
    return 0
  }
