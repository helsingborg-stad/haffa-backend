import Koa from 'koa'
import { ApplicationContext, ApplicationModule, getEnv } from '@helsingborg-stad/gdi-api-node'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'
import EmailValidator from 'email-validator'
import { HaffaUser, LoginService } from './types'

export const loginModule =(loginService: LoginService): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => {
	const secret = getEnv('JWT_SHARED_SECRET')
	const jwtOptions = {
		audience: 'urn://haffa',
		subject: 'haffa-web-client',
	} 
	const verifyToken: Koa.Middleware = (ctx) => {
		const { request: { body: { token } } } = ctx
		try {
			jwt.verify((token || '').toString(), secret, {
				...jwtOptions,
				maxAge: '30d',
			})
			ctx.body = {
				token,
			}
		} catch (e) {
			ctx.body = {
				token: '',
			}
		}
	}

	const requestPincode: Koa.Middleware = async (ctx) => {
		const email = (ctx?.request?.body?.email || '').toString()
		const isValid = EmailValidator.validate(email)
		const status = isValid ? await loginService.requestPincode(email) : 'invalid'
		ctx.body = { status }
	}

	const login: Koa.Middleware = async (ctx) => {
		const email = (ctx?.request?.body?.email || '').toString()
		const pincode = (ctx?.request?.body?.pincode || '').toString()

		if (!EmailValidator.validate(email)) {
			ctx.throw(HttpStatusCodes.BAD_REQUEST)
		}

		const createToken = (user: HaffaUser) => jwt.sign(
			{
				id: email,
				roles: user.roles,
			},
			secret,
			{
				...jwtOptions,
				expiresIn: '30d',
			})
		const user = await loginService.tryLogin(email, pincode)
		ctx.body = {
			token: user ? createToken(user) : '',
		}
	}
	
	registerKoaApi({
		verifyToken,
		requestPincode,
		login,
	})
}
