import type { CategoryRepository, GetCategories } from '../categories/types'
import type { LogEvent, LogEventContext } from './types'

export const createLogEvent = async (
  event: string,
  categories: GetCategories,
  {
    by,
    quantity,
    advert: {
      category,
      contact: { organization },
    },
  }: LogEventContext
): Promise<LogEvent> => ({
  event,
  at: new Date().toISOString(),
  by: by.id,
  quantity,
  organization,
  ...(await createCategoryEvent(category, categories)),
})

const createCategoryEvent = async (
  category: string,
  { getCategories }: GetCategories
): Promise<Pick<LogEvent, 'category' | 'co2kg'>> => {
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
