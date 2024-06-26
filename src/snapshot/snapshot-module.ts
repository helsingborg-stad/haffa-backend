import HttpStatusCodes from 'http-status-codes'
import type { Services } from '../types'
import { normalizeRoles } from '../login'
import type { ImportSnapshotFunction, SnapshotFunction } from './types'
import {
  advertsSnapshot,
  importAdvertsSnapshot,
} from './adverts/adverts-snapshot'
import { requireHaffaUser } from '../login/require-haffa-user'
import {
  categoriesSnapshot,
  importCategoriesSnapshot,
} from './categories/categories-snapshot'
import type { ApplicationModule } from '../lib/gdi-api-node'

const snapshotHandlers: Record<string, SnapshotFunction> = {
  adverts: advertsSnapshot,
  categories: categoriesSnapshot,
}

const importSnapshotHandlers: Record<string, ImportSnapshotFunction> = {
  adverts: importAdvertsSnapshot,
  categories: importCategoriesSnapshot,
}

export const snapshotModule =
  (services: Services): ApplicationModule =>
  ({ registerKoaApi }) =>
    registerKoaApi({
      snapshot: requireHaffaUser(services.userMapper, async (ctx, next) => {
        const {
          user,
          params: { collection },
        } = ctx
        if (!normalizeRoles(user?.roles).canRunSystemJobs) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        const handler = snapshotHandlers[collection]
        return handler ? handler(ctx, services) : next()
      }),
      importSnapshot: requireHaffaUser(services.userMapper, async ctx => {
        const {
          user,
          params: { collection },
          request: { body },
        } = ctx
        if (!normalizeRoles(user?.roles).canRunSystemJobs) {
          return ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        const data = body as any
        const handler =
          data?.snapshot === collection && Array.isArray(data[collection])
            ? importSnapshotHandlers[collection]
            : null

        if (!handler) {
          return ctx.throw(HttpStatusCodes.BAD_REQUEST)
        }

        await handler(user, services, data[collection])
        ctx.body = { success: true }
        return undefined
      }),
    })
