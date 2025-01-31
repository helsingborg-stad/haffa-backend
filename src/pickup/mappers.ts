import { normalizeAdvertLocation } from '../adverts/mappers'
import type { Advert } from '../adverts/types'
import type { PickupLocation } from './types'

export const normalizePickupLocation = (
  l: Partial<PickupLocation> | null
): PickupLocation => ({
  name: l?.name?.trim() ?? '',
  adress: l?.adress?.trim() ?? '',
  zipCode: l?.zipCode?.trim() ?? '',
  city: l?.city?.trim() ?? '',
  country: l?.country?.trim() ?? '',
  notifyEmail: l?.notifyEmail?.trim() ?? '',
  trackingName: l?.trackingName?.trim() ?? '',
  tags: (Array.isArray(l?.tags) ? l?.tags ?? [] : [])
    .filter(v => v)
    .map(s => s.toString().trim()),
})

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
    trackingName: l.trackingName?.trim() ?? '',
    tags: (Array.isArray(l.tags) ? l.tags : [])
      .filter(v => v)
      .map(s => s.toString().trim()),
  })) ?? []

export const patchAdvertWithPickupLocation = (
  advert: Advert,
  location?: PickupLocation
): Advert => ({
  ...advert,
  location: normalizeAdvertLocation(location || advert.location),
})
