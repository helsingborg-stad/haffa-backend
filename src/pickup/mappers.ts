import type { PickupLocation } from './types'

export const normalizePickupLocations = (
  locations: Partial<PickupLocation>[] | null
): PickupLocation[] =>
  locations?.map(l => ({
    name: l.name?.trim() ?? '',
    adress: l.adress?.trim() ?? '',
    zipCode: l.zipCode?.trim() ?? '',
    city: l.city?.trim() ?? '',
    country: l.country?.trim() ?? '',
    notifyEmail: l.notifyEmail?.trim() ?? '',
    tags: (Array.isArray(l.tags) ? l.tags : [])
      .filter(v => v)
      .map(s => s.toString().trim()),
  })) ?? []
