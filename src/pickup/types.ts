import type { AdvertLocation } from '../adverts/types'

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
}
