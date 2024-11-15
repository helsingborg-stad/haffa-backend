import type { GetCategories } from '../categories/types'
import type { HaffaUser } from '../login/types'
import type { GetProfile, ProfileInput } from '../profile/types'
import type { LogEvent, LogEventContext } from './types'

export const createLogEvent = async (
  event: string,
  profiles: GetProfile,
  categories: GetCategories,
  {
    by,
    quantity,
    advert: {
      id,
      category,
      contact: { organization },
    },
  }: LogEventContext,
  impersonate: Partial<ProfileInput> | null
): Promise<LogEvent> => ({
  event,
  at: new Date().toISOString(),
  quantity,
  organization,
  advertId: id,
  ...(await createCategoryEvent(category, categories)),
  ...(await createByEvent(by, profiles, impersonate)),
})

const createByEvent = async (
  by: HaffaUser,
  { getProfile }: GetProfile,
  impersonate: Partial<ProfileInput> | null
): Promise<Pick<LogEvent, 'by' | 'byOrganization'>> =>
  getProfile(by).then(profile => ({
    by: by.id,
    byOrganization: impersonate?.organization || profile?.organization,
  }))

const createCategoryEvent = async (
  category: string,
  { getCategories }: GetCategories
): Promise<Pick<LogEvent, 'category' | 'co2kg' | 'valueByUnit'>> => {
  if (!category) {
    return {}
  }
  const categories = await getCategories()
  const found = categories.find(c => c.id === category)
  return found
    ? {
        category: found.label,
        co2kg: found.co2kg,
        valueByUnit: found.valueByUnit,
      }
    : {}
}
