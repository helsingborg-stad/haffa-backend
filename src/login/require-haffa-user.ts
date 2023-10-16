import type Koa from 'koa'
import { StatusCodes } from 'http-status-codes'
import type { UserMapper } from '../users/types'
import type { HaffaUser } from './types'

export const requireHaffaUser =
  (userMapper: UserMapper, mv: Koa.Middleware): Koa.Middleware =>
  async (ctx, next) => {
    ctx.user = await userMapper.mapAndValidateUser(ctx.user)
    if (ctx.user) {
      return mv(ctx, next)
    }
    return ctx.throw(StatusCodes.UNAUTHORIZED)
  }

export const requireHaffaUserRole = (
  userMapper: UserMapper,
  validate: (user: HaffaUser) => boolean,
  mv: Koa.Middleware
): Koa.Middleware =>
  requireHaffaUser(userMapper, (ctx, next) => {
    if (!validate(ctx.user)) {
      return ctx.throw(StatusCodes.UNAUTHORIZED)
    }
    return mv(ctx, next)
  })
