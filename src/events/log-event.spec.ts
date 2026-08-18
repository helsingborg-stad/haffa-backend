import type { Category } from '../categories/types'
import { createCategoryEvent } from './log-event'

const createGetCategories = (categories: Category[]) => ({
  getCategories: jest.fn().mockResolvedValue(categories),
})

describe('createCategoryEvent', () => {
  it('returns no category, co2kg or valueByUnit when advert has no category and no values', async () => {
    await expect(
      createCategoryEvent(
        { category: '', co2kg: 0, valueByUnit: 0 },
        createGetCategories([])
      )
    ).resolves.toEqual({})
  })

  it('uses the advert co2kg and valueByUnit when set, without looking up a category', async () => {
    const getCategories = createGetCategories([])
    await expect(
      createCategoryEvent(
        { category: '', co2kg: 12, valueByUnit: 34 },
        getCategories
      )
    ).resolves.toEqual({ co2kg: 12, valueByUnit: 34 })
    expect(getCategories.getCategories).not.toHaveBeenCalled()
  })

  it('resolves the category label and falls back to its co2kg/valueByUnit when the advert has none', async () => {
    await expect(
      createCategoryEvent(
        { category: '<category-id>', co2kg: 0, valueByUnit: 0 },
        createGetCategories([
          {
            id: '<category-id>',
            parentId: '',
            label: '<category-label>',
            co2kg: 5,
            valueByUnit: 7,
          },
        ])
      )
    ).resolves.toEqual({
      category: '<category-label>',
      co2kg: 5,
      valueByUnit: 7,
    })
  })

  it('prefers the advert co2kg/valueByUnit over the category ones', async () => {
    await expect(
      createCategoryEvent(
        { category: '<category-id>', co2kg: 12, valueByUnit: 34 },
        createGetCategories([
          {
            id: '<category-id>',
            parentId: '',
            label: '<category-label>',
            co2kg: 5,
            valueByUnit: 7,
          },
        ])
      )
    ).resolves.toEqual({
      category: '<category-label>',
      co2kg: 12,
      valueByUnit: 34,
    })
  })

  it('omits the category when it cannot be found', async () => {
    await expect(
      createCategoryEvent(
        { category: '<missing-category-id>', co2kg: 0, valueByUnit: 0 },
        createGetCategories([
          {
            id: '<other-category-id>',
            parentId: '',
            label: '<category-label>',
            co2kg: 5,
            valueByUnit: 7,
          },
        ])
      )
    ).resolves.toEqual({})
  })
})
