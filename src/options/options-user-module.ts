import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import type { SettingsService } from '../settings/types'
import { optionsAdapter } from './options-adapter'
import { allowedCollections } from './options-whitelist'

export const optionsUserModule =
  (settings: SettingsService): ApplicationModule =>
  ({ registerKoaApi }) =>
    registerKoaApi({
      options: async ctx => {
        if (allowedCollections.includes(ctx.params.collection)) {
          ctx.response.body = await optionsAdapter(settings).getOptions(
            ctx.params.collection
          )
        } else {
          ctx.response.status = HttpStatusCodes.UNAUTHORIZED
        }
      },
    })
