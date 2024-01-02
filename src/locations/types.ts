import type { AdvertLocation } from '../adverts/types'

export interface LocationRepository {
  getLocations: () => Promise<AdvertLocation[]>
  updateLocations: (locations: AdvertLocation[]) => Promise<AdvertLocation[]>
}
