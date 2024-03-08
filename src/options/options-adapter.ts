import type { SettingsService } from '../settings/types'
import type { Option } from './types'

const normalizeOptions = (options: Option[] | null): Option[] =>
  Array.isArray(options)
    ? options
        .filter(
          option =>
            typeof option?.key === 'string' && typeof option?.value !== 'object'
        )
        .map(option => ({
          key: option.key.trim(),
          value: String(option.value ?? ''),
        }))
    : []

export const optionsAdapter = (settings: SettingsService) => ({
  getOptions: (name: string) =>
    settings.getSetting<Option[]>(`options-${name}`).then(normalizeOptions),
  updateOptions: (name: string, options: Option[]) =>
    settings.updateSetting(`options-${name}`, normalizeOptions(options)),
})
