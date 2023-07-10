import type { Advert, AdvertFilterInput } from "../types"
import { createFieldFilterPredicate } from "./field-filter-predicate"
import type { Predicate } from "./types"

const regexpEscape = (s: string): string => s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

const createFreeTextPredicate = (search: string): Predicate<Advert> => {
  // extract individual words from search

  const matchers = ((search||'').match(/(\w+)/g) || [])
    .filter(v => v)
    .filter(v => v.length >= 3)
    .map(regexpEscape)
    .map(re => new RegExp(re, 'ig'))

  return matchers.length > 0
  ? advert => matchers.some(re => re.test(advert.title) || re.test(advert.description)) 
  : () => true
}


export const createAdvertFilterPredicate = (input?: AdvertFilterInput): Predicate<Advert> => {
  const matchers = [
    createFreeTextPredicate(input?.search || ''),
    createFieldFilterPredicate(input?.fields)
  ]

  // logical AND on all matchers
  return (advert) => matchers.every(matcher => matcher(advert))
}
