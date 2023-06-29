import { requireJwtUser } from '@helsingborg-stad/gdi-api-node'
import Koa from 'koa'
import { StatusCodes } from 'http-status-codes'
import { tryCreateHaffaUser } from './try-create-haffa-user'

export const requireHaffaUser = (mv: Koa.Middleware): Koa.Middleware => requireJwtUser((ctx, next) => {
	ctx.user = tryCreateHaffaUser(ctx.user)
	if (ctx.user) {
		return mv(ctx, next)
	}
	ctx.throw(StatusCodes.UNAUTHORIZED)
})
