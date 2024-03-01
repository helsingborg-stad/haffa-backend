import { type Context } from 'koa'
import type { Services } from '../types'
import type { HaffaUser } from '../login/types'

export type SnapshotFunction = (ctx: Context, services: Services) => any

export type ImportSnapshotFunction = (
  user: HaffaUser,
  services: Services,
  data: any
) => Promise<any>
