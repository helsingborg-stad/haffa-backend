import type { AdvertLocation } from '../adverts/types'
import type { SettingsService } from '../settings/types'
import { normalizeLocations } from './mappers'

export const locationsAdapter = (settings: SettingsService) => ({
  getLocations: () =>
    settings.getSetting<AdvertLocation[]>('locations').then(normalizeLocations),
  updateLocations: (locations: Partial<AdvertLocation>[]) =>
    settings
      .updateSetting('locations', normalizeLocations(locations))
      .then(value => value),
})
