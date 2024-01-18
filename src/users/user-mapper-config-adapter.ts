import type { SettingsService } from '../settings/types'
import type { UserMapperConfig } from './types'

const normalizeConfig = (config: UserMapperConfig | null): UserMapperConfig => {
  const { allowGuestUsers, phoneCountry } = config || {}
  return {
    allowGuestUsers: !!allowGuestUsers,
    phoneCountry: phoneCountry?.toString() || '',
  }
}

export const userMapperConfigAdapter = (settings: SettingsService) => ({
  getUserMapperConfig: () =>
    settings.getSetting<UserMapperConfig>(`user-mapper`).then(normalizeConfig),
  updateUserMapperConfig: (patch: Partial<UserMapperConfig>) =>
    settings
      .getSetting<UserMapperConfig>(`user-mapper`)
      .then(normalizeConfig)
      .then(source => ({ ...source, ...patch }))
      .then(normalizeConfig)
      .then(s => settings.updateSetting(`user-mapper`, s))
      .then(normalizeConfig),
})
