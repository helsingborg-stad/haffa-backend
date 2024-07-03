import type { Category } from '../../../categories/types'
import { mapTree } from '../../../lib'
import type { AdvertFilterInput, FilterInput } from '../../types'

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
export const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string

export const convertFilterToCategoryMatchingFilter = async (
  filter: AdvertFilterInput,
  { getCategories }: { getCategories: () => Promise<Category[]> }
): Promise<AdvertFilterInput> => {
  // Test if existing category filter is compatible
  // We only allow undefined or totally empty
  const isCompatibleCategoryField = (c?: FilterInput<string>): boolean =>
    // const {contains, ne, eq, gt, gte, lt, lte} = c	|| {}
    // return [contains, ne, eq, gt, gte, lt, lte].every(v => v === undefined)
    c === undefined || Object.values(c).every(v => v === undefined)

  const search = filter.search?.trim() || ''
  if (!search) {
    return filter
  }

  // make sure that category search isn't already used in some weird way
  if (!isCompatibleCategoryField(filter.fields?.category)) {
    return filter
  }

  // do we have any interesting search terms?
  if (!search.split(/\s/).some(term => term.length >= 3)) {
    return filter
  }

  const categories = await getCategories()

  // convert freetext search to a list if category search candidates
  const terms = search
    .split(/\s/)
    .map(term => ({
      term,
      re: term.length >= 3 ? new RegExp(term, 'i') : null,
    }))
    .map(({ term, re }) => ({
      term,
      categoryIds: re
        ? categories.filter(({ label }) => re.test(label)).map(({ id }) => id)
        : [],
    }))

  const categoryIds = terms
    .map(t => t.categoryIds)
    .reduce((all, l) => all.concat(l), [])
  if (categoryIds.length === 0) {
    return filter
  }

  const { getChildrenRec } = mapTree(
    categories,
    c => c.id,
    c => c.parentId
  )
  const allCategoryIds = [...getChildrenRec(...categoryIds)].map(({ id }) => id)

  return {
    ...filter,
    pipelineCategoryIds: allCategoryIds,
    /*
    pipelineOr: [
      ...(filter.pipelineOr || []),
      {
        fields: {
          category: {
            in: allCategoryIds,
          },
        },
      },
    ],
    */
  }
}
