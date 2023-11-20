import type { SettingsService } from '../settings/types'
import type { UserMapperConfig } from './types'

const normalizeConfig = (config: UserMapperConfig | null): UserMapperConfig => {
  const { allowGuestUsers } = config || {}
  return {
    allowGuestUsers: !!allowGuestUsers,
  }
}

export const userMapperConfigAdapter = (settings: SettingsService) => ({
  getUserMapperConfig: () =>
    settings.getSetting<UserMapperConfig>(`user-mapper`).then(normalizeConfig),
  updateUserMapperConfig: (config: UserMapperConfig) =>
    settings.updateSetting(`user-mapper`, normalizeConfig(config)),
})
