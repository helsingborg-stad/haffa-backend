import type { SettingsService } from '../settings/types'
import type { AdvertFieldConfig, FieldConfig } from './types'
import { ConfigurableFields, FieldLabels } from './types'

const createEmptyConfiguration = (): AdvertFieldConfig =>
  ConfigurableFields.map(name => ({
    name,
    label: FieldLabels[name] ?? name,
    visible: true,
    mandatory: false,
    initial: '',
    adornment: '',
  }))

export const normalizeFieldConfig = (fieldConfig: AdvertFieldConfig | null) => {
  const fieldList = [...createEmptyConfiguration(), ...(fieldConfig || [])]

  const filteredList = fieldList
    .reduce<Array<FieldConfig | null>>(
      (p, c) => [...p, ConfigurableFields.includes(c.name) ? c : null],
      []
    )
    .filter(v => v) as AdvertFieldConfig

  const mapper = new Map<string, FieldConfig>()

  filteredList.forEach(f => {
    mapper.set(f.name, {
      ...(mapper.get(f.name) || {}),
      ...f,
    })
  })
  return Array.from(mapper.values())
}

export const advertFieldConfigAdapter = (settings: SettingsService) => ({
  getFieldConfig: () =>
    settings
      .getSetting<AdvertFieldConfig>('advert-field-config')
      .then(normalizeFieldConfig),
  updateFieldConfig: (fieldConfig: AdvertFieldConfig) =>
    settings
      .updateSetting('advert-field-config', fieldConfig)
      .then(normalizeFieldConfig),
})
