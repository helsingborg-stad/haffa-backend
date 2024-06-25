import type { IncomingHttpHeaders } from 'http'
import { apiKeysAdapter } from './api-keys-adapter'
import type { SettingsService } from '../settings/types'
import { makeUser } from '../login'
import type { ApplicationModule } from '../lib/gdi-api-node'

/** Given (Koa) headers, extract bearer token */
const getApiKeySecretFromAuthorizationHeader = (
  headers: IncomingHttpHeaders
): string | null =>
  /^api-key\s(.+)$/gim.exec(headers?.authorization as string)?.[1]?.trim() ||
  null

export const apiKeyUserModule =
  (settings: SettingsService): ApplicationModule =>
  ({ app }) =>
    app.use(async (ctx, next) => {
      if (ctx.user) {
        return next()
      }
      const secret = getApiKeySecretFromAuthorizationHeader(ctx.headers)
      if (!secret) {
        return next()
      }

      const apiKeys = await apiKeysAdapter(settings).getApiKeys()
      const match = apiKeys.find(k => k.secret === secret)
      if (!match) {
        return next()
      }
      const { expires } = match
      if (expires && Date.parse(expires) < Date.now()) {
        return next()
      }

      if (match) {
        ctx.user = makeUser({ id: match.email })
      }
      return next()
    })
