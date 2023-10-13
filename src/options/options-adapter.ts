import type { SettingsService } from '../settings/types'
import type { Option } from './types'

const normalizeOptions = (options: Option[] | null): Option[] =>
  Array.isArray(options) ? options : []

export const optionsAdapter = (settings: SettingsService) => ({
  getOptions: (name: string) =>
    settings.getSetting<Option[]>(name).then(normalizeOptions),
  updateOptions: (name: string, options: Option[]) =>
    settings.updateSetting(name, options).then(normalizeOptions),
})
