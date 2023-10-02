import type { HaffaUser } from '../../login/types'
import { getAdvertMeta } from '../advert-meta'
import {
  AdvertClaimType,
  type Advert,
  type AdvertFilterInput,
  type AdvertRestrictionsFilterInput,
} from '../types'
import { createFieldFilterPredicate } from './field-filter-predicate'
import type { Predicate } from './types'

const regexpEscape = (s: string): string =>
  s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

const createFreeTextPredicate = (search: string): Predicate<Advert> => {
  // extract individual words from search

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes#looking_for_a_word_from_unicode_characters
  const matchers = (
    (search || '').match(/([\u0000-\u0019\u0021-\uFFFF]+)/gm) || []
  )
    .filter(v => v)
    .filter(v => v.length >= 3)
    .map(regexpEscape)
    .map(re => new RegExp(re, 'ig'))

  return matchers.length > 0
    ? advert =>
        matchers.some(
          re => re.test(advert.title) || re.test(advert.description)
        )
    : () => true
}

const createRestrictionsPredicate = (
  user: HaffaUser,
  restrictions: AdvertRestrictionsFilterInput
): Predicate<Advert> => {
  const makeMatcher = (
    test: boolean | undefined,
    testTrue: Predicate<Advert>,
    testFalse?: Predicate<Advert>
  ): Predicate<Advert> | null =>
    // eslint-disable-next-line no-nested-ternary
    test === true
      ? testTrue
      : test === false
      ? advert => (testFalse ? testFalse(advert) : !testTrue(advert))
      : null

  const matchers: Predicate<Advert>[] = [
    makeMatcher(
      restrictions?.createdByMe,
      ({ createdBy }) => createdBy === user.id
    ),
    makeMatcher(restrictions?.reservedByMe, ({ claims }) =>
      claims.some(
        ({ by, type }) => by === user.id && type === AdvertClaimType.reserved
      )
    ),
    makeMatcher(restrictions?.collectedByMe, ({ claims }) =>
      claims.some(
        ({ by, type }) => by === user.id && type === AdvertClaimType.collected
      )
    ),
    makeMatcher(
      restrictions?.canBeReserved,
      advert => getAdvertMeta(advert, user).canReserve
    ),
    makeMatcher(
      restrictions?.isArchived,
      ({ archivedAt, createdBy }) => !!archivedAt && createdBy === user.id,
      ({ archivedAt }) => !archivedAt
    ),
    makeMatcher(!restrictions?.isArchived, ({ archivedAt }) => !archivedAt),
    makeMatcher(restrictions?.hasReservations, ({ claims }) =>
      claims.some(({ type }) => type === AdvertClaimType.reserved)
    ),
    makeMatcher(restrictions?.hasCollects, ({ claims }) =>
      claims.some(({ type }) => type === AdvertClaimType.collected)
    ),
  ].filter(p => p) as Predicate<Advert>[]

  return matchers.length > 0
    ? advert => matchers.every(m => m(advert))
    : () => true
}

export const createAdvertFilterPredicate = (
  user: HaffaUser,
  input?: AdvertFilterInput
): Predicate<Advert> => {
  const matchers = [
    createFreeTextPredicate(input?.search || ''),
    createFieldFilterPredicate(input?.fields),
    createRestrictionsPredicate(user, input?.restrictions || {}),
  ]
  // logical AND on all matchers
  return advert => matchers.every(matcher => matcher(advert))
}
