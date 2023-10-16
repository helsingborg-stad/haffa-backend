import type { CookieService } from '../types'

export const createCookieService = (cookieName: string): CookieService => ({
  getTokenFromCookie: ctx => ctx.cookies.get(cookieName) || '',
  setCookieToken: (ctx, token) =>
    ctx.cookies.set(cookieName, token || undefined),
})
