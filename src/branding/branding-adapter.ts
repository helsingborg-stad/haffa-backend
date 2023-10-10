import type { SettingsService } from '../settings/types'
import type { Option } from './types'

const COLLECTION_NAME = 'branding-options'

const normalizeBrandingOptions = (options: Option[] | null): Option[] =>
  Array.isArray(options) ? options : []

export const brandingAdapter = (settings: SettingsService) => ({
  getBrandingOptions: () =>
    settings
      .getSetting<Option[]>(COLLECTION_NAME)
      .then(normalizeBrandingOptions),
  updateBrandingOptions: (options: Option[]) =>
    settings
      .updateSetting(COLLECTION_NAME, options)
      .then(normalizeBrandingOptions),
})
