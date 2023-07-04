import type Koa from 'koa'
import type {
  ApplicationContext,
  ApplicationModule,
} from '@helsingborg-stad/gdi-api-node'
import HttpStatusCodes from 'http-status-codes'
import EmailValidator from 'email-validator'
import type { LoginService } from './types'
import type { TokenService } from '../tokens/types'

export const loginModule =
  (loginService: LoginService, tokenService: TokenService): ApplicationModule =>
  ({ registerKoaApi }: ApplicationContext) => {
    const verifyToken: Koa.Middleware = (ctx) => {
      const {
        request: {
          body: { token },
        },
      } = ctx as any
      ctx.body = {
        token: tokenService.verify(token as string) ? token : '',
      }
    }

    const requestPincode: Koa.Middleware = async (ctx: any) => {
      const email = (ctx?.request?.body?.email || '').toString()
      const isValid = EmailValidator.validate(email)
      const status = isValid
        ? await loginService.requestPincode(email)
        : 'invalid'
      ctx.body = { status }
    }

    const login: Koa.Middleware = async (ctx: any) => {
      const email = (ctx?.request?.body?.email || '').toString()
      const pincode = (ctx?.request?.body?.pincode || '').toString()

      if (!EmailValidator.validate(email)) {
        ctx.throw(HttpStatusCodes.BAD_REQUEST)
      }

      const user = await loginService.tryLogin(email, pincode)
      ctx.body = {
        token: user ? tokenService.sign(user) : '',
      }
    }

    registerKoaApi({
      verifyToken,
      requestPincode,
      login,
    })
  }
