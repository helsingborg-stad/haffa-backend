import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import type { SettingsService } from '../settings/types'
import { optionsAdapter } from './options-adapter'
import { type Option } from './types'
import { userMapperConfigAdapter } from '../users'

const getSystemSettings = async (
  settings: SettingsService
): Promise<Option[]> => {
  const {
    allowGuestUsers,
    phone: { allowPhoneUsers },
  } = await userMapperConfigAdapter(settings).getUserMapperConfig()

  return [
    {
      key: 'allowEmailUsers',
      value: 'true',
    },
    {
      key: 'allowGuestUsers',
      value: allowGuestUsers ? 'true' : 'false',
    },
    {
      key: 'allowPhoneUsers',
      value: allowPhoneUsers ? 'true' : 'false',
    },
  ]
}

export const optionsUserModule =
  (settings: SettingsService): ApplicationModule =>
  ({ registerKoaApi }) =>
    registerKoaApi({
      systemSettings: async ctx => {
        ctx.response.body = await getSystemSettings(settings)
      },
      options: async ctx => {
        const {
          params: { collection },
        } = ctx
        ctx.response.body = await optionsAdapter(settings).getOptions(
          collection
        )
      },
    })
