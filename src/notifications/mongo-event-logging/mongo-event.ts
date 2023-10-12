import { randomUUID } from 'crypto'
import type { Advert } from '../../adverts/types'
import type { HaffaUser } from '../../login/types'
import type { MongoEvent } from './types'
import type { Category } from '../../categories/types'

export const createMongoEvent = async (
  event: string,
  {
    by,
    quantity,
    advert: {
      category,
      contact: { organization },
    },
    getCategories,
  }: {
    by: HaffaUser
    quantity?: number
    advert: Advert
    getCategories: () => Promise<Category[]>
  }
): Promise<MongoEvent> => ({
  id: randomUUID().split('-').join(''),
  event,
  at: new Date().toISOString(),
  by: by.id,
  quantity,
  organization,
  ...(await createMongoCategoryEvent(category, getCategories)),
})

const createMongoCategoryEvent = async (
  category: string,
  getCategories: () => Promise<Category[]>
): Promise<Pick<MongoEvent, 'category' | 'co2kg'>> => {
  if (!category) {
    return {}
  }
  const categories = await getCategories()
  const found = categories.find(c => c.id === category)
  return found
    ? {
        category: found.label,
        co2kg: found.co2kg,
      }
    : {}
}
