import type Koa from 'koa'
import type {
  ApplicationContext,
  ApplicationModule,
} from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import { RequestPincodeStatus } from './types'
import type { CookieService, LoginService } from './types'
import type { TokenService } from '../tokens/types'
import type { NotificationService } from '../notifications/types'
import { rolesToRolesArray } from '.'
import { requireHaffaUserRole } from './require-haffa-user'
import type { UserMapper } from '../users/types'
import { isValidEmail } from '../users'

export const loginModule =
  (
    loginService: LoginService,
    tokenService: TokenService,
    userMapper: UserMapper,
    cookies: CookieService,
    notifications: NotificationService
  ): ApplicationModule =>
  ({ registerKoaApi }: ApplicationContext) => {
    const verifyToken: Koa.Middleware = async ctx => {
      const test = (t: any) => (typeof t === 'string' ? t.trim() : null)

      const token =
        test((ctx as any).request?.body?.token) ||
        test(cookies.getTokenFromCookie(ctx)) ||
        test(await userMapper.tryCreateGuestToken(tokenService)) ||
        ''

      const user = await tokenService.decode(token)

      cookies.setCookieToken(ctx, user ? token : '')

      ctx.body = user
        ? {
            token,
            roles: rolesToRolesArray(user.roles),
            guest: !!user.guest,
          }
        : {
            token: '',
            roles: [],
            guest: false,
          }
    }

    const requestPincode: Koa.Middleware = async (ctx: any) => {
      const email = (ctx?.request?.body?.email || '').toString().toLowerCase()
      const isValid = isValidEmail(email)
      const { status, pincode } = isValid
        ? await loginService.requestPincode(email, ctx.ip)
        : { status: RequestPincodeStatus.invalid, pincode: '' }

      if (status === RequestPincodeStatus.accepted) {
        await notifications.pincodeRequested(email, pincode)
      }
      ctx.body = { status }
    }

    const login: Koa.Middleware = async (ctx: any) => {
      const email = (ctx?.request?.body?.email || '')
        .toString()
        .toLowerCase()
        .trim()
      const pincode = (ctx?.request?.body?.pincode || '').toString()

      if (!isValidEmail(email)) {
        ctx.throw(HttpStatusCodes.BAD_REQUEST)
      }

      const user = await loginService.tryLogin(email, pincode, ctx.ip)
      const token = user ? tokenService.sign(user) : ''
      const roles = rolesToRolesArray(user?.roles)

      cookies.setCookieToken(ctx, token)

      ctx.body = {
        token,
        roles,
        guest: user ? !!user.guest : true,
      }
    }

    const signout: Koa.Middleware = async (ctx: any) => {
      cookies.setCookieToken(ctx, '')
      ctx.body = {}
    }

    const effectivePermissions: Koa.Middleware = requireHaffaUserRole(
      userMapper,
      u => u.roles?.canEditSystemLoginPolicies || false,
      async (ctx: any) => {
        const email = (ctx?.request?.body?.email || '')
          .toString()
          .toLowerCase()
          .trim()
        const effectiveUser = await userMapper.mapAndValidateEmail(email)
        ctx.body = {
          email,
          canLogin: !!effectiveUser,
          roles: rolesToRolesArray(effectiveUser?.roles),
        }
      }
    )

    registerKoaApi({
      verifyToken,
      requestPincode,
      login,
      signout,
      effectivePermissions,
    })
  }
