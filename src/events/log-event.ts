import type { Advert } from '../adverts/types'
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
      co2kg,
      valueByUnit,
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
  ...(await createCategoryEvent({ category, co2kg, valueByUnit }, categories)),
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

export const createCategoryEvent = async (
  {
    category,
    co2kg: advertCo2kg,
    valueByUnit: advertValueByUnit,
  }: Pick<Advert, 'category' | 'co2kg' | 'valueByUnit'>,
  { getCategories }: GetCategories
): Promise<Pick<LogEvent, 'category' | 'co2kg' | 'valueByUnit'>> => {
  const found = category
    ? (await getCategories()).find(c => c.id === category)
    : undefined
  const co2kg = advertCo2kg || found?.co2kg || 0
  const valueByUnit = advertValueByUnit || found?.valueByUnit || 0
  return {
    ...(found ? { category: found.label } : {}),
    ...(co2kg ? { co2kg } : {}),
    ...(valueByUnit ? { valueByUnit } : {}),
  }
}
