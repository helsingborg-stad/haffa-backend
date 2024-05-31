import { normalizeCategories } from '../../categories/category-adapter'
import type { Category } from '../../categories/types'
import { uniqueBy } from '../../lib'

export const patchCategories = (
  existing: Category[],
  patch: Category[]
): Category[] =>
  fixParentLinks(
    [...normalizeCategories(existing), ...normalizeCategories(patch)]
      .filter(uniqueBy(({ id }) => id))
      .filter(({ label }) => label)
  )

const fixParentLinks = (cats: Category[]): Category[] => {
  const ids = new Set<String>(cats.map(({ id }) => id))
  return cats.map(c => ({
    ...c,
    parentId: ids.has(c.parentId) ? c.parentId : '',
  }))
}
