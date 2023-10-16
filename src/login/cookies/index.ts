import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { StartupLog } from '../../types'
import type { CookieService } from '../types'
import { createCookieService } from './cookie-service'

export { createCookieService }

export const createCookieServiceFromEnv = (
  startupLog: StartupLog
): CookieService => {
  const cookieName = getEnv('TOKEN_COOKIE_NAME', { fallback: 'haffa-token' })
  return startupLog.echo(createCookieService(cookieName), {
    name: 'cookies',
    config: {
      cookieName,
    },
  })
}
