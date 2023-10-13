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

const normalizeCategories = (categories: Category[] | null): Category[] =>
  Array.isArray(categories)
    ? categories
        .map(({ id, parentId, label, co2kg }) => ({
          id: trim(id),
          parentId: trim(parentId),
          label: trim(label),
          co2kg: co2kg || 0,
        }))
        .filter(({ id }) => id)
    : []
