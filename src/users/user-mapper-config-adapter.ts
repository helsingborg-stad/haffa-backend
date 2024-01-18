import type { SettingsService } from '../settings/types'
import type { UserMapperConfig } from './types'

const normalizeConfig = (
  config: Partial<UserMapperConfig> | null
): UserMapperConfig => ({
  allowGuestUsers: !!config?.allowGuestUsers,
  phone: {
    sender: config?.phone?.sender || 'Haffa',
    country: config?.phone?.country || 'SE',
    roles: config?.phone?.roles || [],
  },
})

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
