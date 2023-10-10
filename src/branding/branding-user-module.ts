import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import type { SettingsService } from '../settings/types'
import { brandingAdapter } from './branding-adapter'

export const brandingUserModule =
  (settings: SettingsService): ApplicationModule =>
  ({ registerKoaApi }) =>
    registerKoaApi({
      branding: async ctx => {
        ctx.response.body = await brandingAdapter(settings).getBrandingOptions()
      },
    })
