import type { HaffaUser } from '../../login/types'
import type { Advert, AdvertFilterInput } from '../types'
import type { Func2 } from './types'

export const createAdvertFilterComparer = (
  user: HaffaUser,
  input?: AdvertFilterInput
): Func2<Advert, Advert, number> => {
  const field = input?.sorting?.field || 'createdAt'
  const ascending = input?.sorting?.ascending !== false

  // NOTE: Array.toSorted() would be a better approach in the future
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted

  // eslint-disable-next-line no-nested-ternary
  const asc = (a: any, b: any): number => (a === b ? 0 : a < b ? -1 : 1)
  // eslint-disable-next-line no-nested-ternary
  const desc = (a: any, b: any): number => (a === b ? 0 : a < b ? 1 : -1)

  return ascending
    ? (a: Advert, b: Advert) => asc(a[field], b[field])
    : (a: Advert, b: Advert) => desc(a[field], b[field])
}
