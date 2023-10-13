export interface Category {
  id: string
  parentId: string
  label: string
  co2kg: number
}

export interface CategoryRepository {
  getCategories: () => Promise<Category[]>
  updateCategories: (categories: Category[]) => Promise<Category[]>
}

export type GetCategories = Pick<CategoryRepository, 'getCategories'>
