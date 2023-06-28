import { requireJwtUser } from '@helsingborg-stad/gdi-api-node'
import Koa from 'koa'
import { tryCreateHaffaUser } from './try-create-haffa-user'

export const requireHaffaUser = (mv: Koa.Middleware): Koa.Middleware => requireJwtUser((ctx, next) => {
	const haffaUser = tryCreateHaffaUser(ctx.user)
	if (haffaUser) {
		ctx.haffaUser = haffaUser
		return mv(ctx, next)
	}
	ctx.throw(401)
})
