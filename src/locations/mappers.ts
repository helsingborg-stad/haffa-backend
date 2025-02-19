import type { AdvertLocation } from '../adverts/types'

export const normalizeLocation = (
  l: Partial<AdvertLocation>
): AdvertLocation => ({
  name: l.name?.trim() ?? '',
  adress: l.adress?.trim() ?? '',
  zipCode: l.zipCode?.trim() ?? '',
  city: l.city?.trim() ?? '',
  country: l.country?.trim() ?? '',
})

export const normalizeLocations = (
  locations: Partial<AdvertLocation>[] | null
): AdvertLocation[] =>
  locations?.map(l => ({
    name: l.name?.trim() ?? '',
    adress: l.adress?.trim() ?? '',
    zipCode: l.zipCode?.trim() ?? '',
    city: l.city?.trim() ?? '',
    country: l.country?.trim() ?? '',
  })) ?? []
