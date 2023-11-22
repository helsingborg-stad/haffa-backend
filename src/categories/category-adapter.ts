import type { SettingsService } from '../settings/types'
import type { Category, CategoryRepository } from './types'

export const categoryAdapter = (
  settings: SettingsService
): CategoryRepository => ({
  getCategories: () =>
    settings.getSetting<Category[]>('categories').then(normalizeCategories),
  updateCategories: (categories: Category[]) =>
    settings.updateSetting('categories', categories).then(normalizeCategories),
})

const trim = (v: any): string => (typeof v === 'string' ? v.trim() : '')

export const normalizeCategories = (
  categories: Category[] | null
): Category[] =>
  Array.isArray(categories)
    ? categories
        .map(({ id, parentId, label, co2kg, valueByUnit }) => ({
          id: trim(id),
          parentId: trim(parentId),
          label: trim(label),
          co2kg: co2kg || 0,
          valueByUnit: valueByUnit ?? 0,
        }))
        .filter(({ id }) => id)
    : []
