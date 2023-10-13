import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import type { SettingsService } from '../settings/types'
import { optionsAdapter } from './options-adapter'

export const optionsUserModule =
  (settings: SettingsService): ApplicationModule =>
  ({ registerKoaApi }) =>
    registerKoaApi({
      options: async ctx => {
        ctx.response.body = await optionsAdapter(settings).getOptions(
          ctx.params.collection
        )
      },
    })
