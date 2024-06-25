import type { ApplicationModule } from '../../lib/gdi-api-node'
import type { AuthorizationService } from '../../lib/gdi-api-node/services/authorization-service'
import type { CookieService } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const cookieUserModule =
  (
    cookies: CookieService,
    authorization: AuthorizationService
  ): ApplicationModule =>
  ({ app }) =>
    app.use(async (ctx, next) => {
      if (ctx.user) {
        return next()
      }
      const token = cookies.getTokenFromCookie(ctx)
      ctx.user = ctx.user || authorization.tryGetUserFromJwt(token)
      return next()
    })
