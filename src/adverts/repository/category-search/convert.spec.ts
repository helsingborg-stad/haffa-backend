import { convertFilterToCategoryMatchingFilter } from './convert-filter-to-category-matching-filter'

describe('convertFilterToCategoryMatchingFilter', () => {
  it('does nothing if there are not matching categories', async () => {
    const f = {
      search: 'I can haz cheezburger',
    }

    expect(
      await convertFilterToCategoryMatchingFilter(f, {
        getCategories: async () => [],
      })
    ).toBe(f)
  })

  it('annotates pipeline with category matchers', async () => {
    const f = {
      search: 'I can haz cheezburger',
    }

    expect(
      await convertFilterToCategoryMatchingFilter(f, {
        getCategories: async () => [
          {
            id: 'c1',
            label: 'CheezBurgers',
            parentId: '',
            co2kg: 0,
            valueByUnit: 0,
          },
        ],
      })
    ).toMatchObject({
      search: 'I can haz cheezburger',
      pipelineOr: [
        {
          fields: {
            category: {
              in: ['c1'],
            },
          },
        },
      ],
    })
  })
})
