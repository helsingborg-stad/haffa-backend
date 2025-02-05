import type { SettingsService } from '../settings/types'
import { normalizePickupLocations } from './mappers'
import type { PickupLocation } from './types'

export const pickupLocationsAdapter = (settings: SettingsService) => ({
  getPickupLocations: () =>
    settings
      .getSetting<PickupLocation[]>('pickup-locations')
      .then(normalizePickupLocations),
  updatePickupLocations: (locations: Partial<PickupLocation>[]) =>
    settings
      .updateSetting('pickup-locations', normalizePickupLocations(locations))
      .then(value => value),
})
