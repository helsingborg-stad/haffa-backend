import Koa from 'koa'
import { ApplicationContext, ApplicationModule, getEnv } from '@helsingborg-stad/gdi-api-node'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'
import EmailValidator from 'email-validator'

export const authenticationModule = (): ApplicationModule => ({ registerKoaApi }: ApplicationContext) => {
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

	const requestPincode: Koa.Middleware = (ctx) => {
		const email = (ctx?.request?.body?.email || '').toString()
		const isValid = EmailValidator.validate(email)
		if (isValid) {
			ctx.body = {
				status: 'accepted',
			}
			console.log(`
# PIN CODE REQUEST
email: ${email}
pincode: type whatever you want
			`)
		} else {
			ctx.body = { status: 'invalid' }
		}
	}

	const authenticate: Koa.Middleware = (ctx) => {
		const email = (ctx?.request?.body?.email || '').toString()

		if (!EmailValidator.validate(email)) {
			ctx.throw(HttpStatusCodes.BAD_REQUEST)
		}
		ctx.body = {
			token: jwt.sign({
				id: email,
			},
			secret,
			{
				...jwtOptions,
				expiresIn: '30d',
			}),
		}
	}
	
	registerKoaApi({
		verifyToken,
		requestPincode,
		authenticate,
	})
}
