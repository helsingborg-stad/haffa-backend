import { normalizeCategories } from './category-adapter'
import type { Category } from './types'

it('should normalize missing fields', () => {
  expect(
    normalizeCategories([
      {
        id: '<id>',
        parentId: '<parentId>',
        label: '<label>',
      },
    ] as Category[])
  ).toMatchObject<Category[]>([
    {
      id: '<id>',
      parentId: '<parentId>',
      label: '<label>',
      co2kg: 0,
      valueByUnit: 0,
    },
  ])
})
it('should normalize null fields', () => {
  expect(
    normalizeCategories([
      {
        id: '<id>',
        parentId: '<parentId>',
        label: '<label>',
        co2kg: null,
        valueByUnit: null,
      },
    ] as unknown as Category[])
  ).toMatchObject<Category[]>([
    {
      id: '<id>',
      parentId: '<parentId>',
      label: '<label>',
      co2kg: 0,
      valueByUnit: 0,
    },
  ])
})
