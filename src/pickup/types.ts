import type { AdvertLocation } from '../adverts/types'
import type { Func } from '../lib/types'

export interface PickupLocation extends AdvertLocation {
  notifyEmail: string
  trackingName: string
  tags: string[]
}

export interface PickupLocationsRepository {
  getPickupLocations: () => Promise<PickupLocation[]>
  updatePickopLocations: (
    locations: PickupLocation[]
  ) => Promise<PickupLocation[]>
  createPickupLocationMatcher: () => Promise<
    Func<{ tags: string[] }, PickupLocation[]>
  >
}
