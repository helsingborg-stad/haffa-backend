import type { SettingsService } from '../settings/types'
import { normalizeTagDescriptions } from './mappers'
import type { TagDescription } from './types'

export const tagsAdapter = (settings: SettingsService) => ({
  getTagDescriptions: () =>
    settings
      .getSetting<TagDescription[]>('options-tag-descriptions')
      .then(normalizeTagDescriptions),
  updateTagDescriptions: (descriptions: Partial<TagDescription>[]) =>
    settings
      .updateSetting(
        'options-tag-descriptions',
        normalizeTagDescriptions(descriptions)
      )
      .then(value => value),
})
