import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import type { UserMapper } from '../users/types'

export const guestUserModule =
  (userMapper: UserMapper): ApplicationModule =>
  ({ app }) =>
    app.use(async (ctx, next) => {
      if (ctx.user) {
        return next()
      }

      ctx.user = await userMapper.tryCreateGuestUser()
      return next()
    })
