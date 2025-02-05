import type { HaffaUser } from '../../login/types'
import { getAdvertMeta } from '../advert-meta'
import { AdvertClaimType } from '../types'
import type {
  AdvertWorkflowInput,
  Advert,
  AdvertFilterInput,
  AdvertRestrictionsFilterInput,
} from '../types'
import { createFieldFilterPredicate } from './field-filter-predicate'
import type { Predicate } from './types'

const regexpEscape = (s: string): string =>
  s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

const createFreeTextPredicate = (search: string): Predicate<Advert> => {
  // extract individual words from search

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes#looking_for_a_word_from_unicode_characters
  const matchers = // eslint-disable-next-line no-control-regex
    ((search || '').match(/([\u0000-\u0019\u0021-\uFFFF]+)/gm) || [])
      .filter(v => v)
      .filter(v => v.length >= 3)
      .map(regexpEscape)
      .map(re => new RegExp(re, 'ig'))

  return matchers.length > 0
    ? advert =>
        matchers.some(
          re =>
            re.test(advert.title) ||
            re.test(advert.description) ||
            re.test(advert.reference)
        )
    : () => true
}

const createWorkflowPredicate = (
  workflow?: AdvertWorkflowInput
): Predicate<Advert> | null => {
  const s = new Set(
    (workflow?.pickupLocationTrackingNames || []).filter(v => v)
  )
  return s.size > 0
    ? a => a.claims.some(c => s.has(c.pickupLocation?.name || ''))
    : null
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
      restrictions.editableByMe,
      ({ createdBy }) =>
        user.roles?.canEditOwnAdverts && user.roles.canManageAllAdverts
          ? true
          : createdBy === user.id,
      () => false
    ),
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

const combineAnd = (
  ...matchers: (Predicate<Advert> | null)[]
): Predicate<Advert> | null => {
  const ml = matchers.filter(v => v)
  // eslint-disable-next-line no-nested-ternary
  return ml.length === 0
    ? null
    : ml.length === 1
    ? ml[0]
    : advert => ml.every(m => m!(advert))
}

const combineOr = (
  ...matchers: (Predicate<Advert> | null)[]
): Predicate<Advert> | null => {
  const ml = matchers.filter(v => v)
  // eslint-disable-next-line no-nested-ternary
  return ml.length === 0
    ? null
    : ml.length === 1
    ? ml[0]
    : advert => ml.some(m => m!(advert))
}

export const createAdvertFilterPredicate = (
  user: HaffaUser,
  input?: AdvertFilterInput
): Predicate<Advert> =>
  combineAnd(
    combineOr(
      combineAnd(
        createFreeTextPredicate(input?.search || ''),
        createFieldFilterPredicate(input?.fields)
      ),
      ...(input?.pipelineOr?.map(({ fields }) =>
        createFieldFilterPredicate(fields)
      ) || [])
    ),
    createRestrictionsPredicate(user, input?.restrictions || {}),
    createWorkflowPredicate(input?.workflow)
  ) ?? (() => true)
