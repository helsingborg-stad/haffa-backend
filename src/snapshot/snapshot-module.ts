import HttpStatusCodes from 'http-status-codes'
import type { ApplicationModule } from '@helsingborg-stad/gdi-api-node'
import { PassThrough } from 'stream'
import type Koa from 'koa'
import type { Services } from '../types'
import type { FilesService } from '../files/types'
import type { Advert } from '../adverts/types'
import { normalizeRoles } from '../login'
import { convertObjectStream, jsonStream } from '../lib/streams'

const createConvertAdvertToAdvertWithInlinedImages =
  (files: FilesService) => (advert: Advert) =>
    Promise.all(
      (advert.images || []).map(image =>
        files
          .tryConvertUrlToDataUrl(image.url)
          .then(url => ({ ...image, url: url || image.url }))
      )
    ).then(images => ({
      ...advert,
      images,
    }))

const convertAdvertsToAdvertWithInlinedImagesStream = (files: FilesService) =>
  convertObjectStream<Advert, Advert>(
    createConvertAdvertToAdvertWithInlinedImages(files)
  )
const snapshotHandlers: Record<
  string,
  (ctx: Koa.Context, services: Services) => any
> = {
  adverts: (ctx, { adverts, files }) => {
    const stream = new PassThrough()
    ctx.type = 'application/json'
    ctx.body = stream
    adverts
      .getSnapshot()
      .pipe(convertAdvertsToAdvertWithInlinedImagesStream(files))
      .pipe(
        jsonStream({
          prefix: '{"snapshot": "adverts", "adverts": [',
          separator: ',',
          terminator: ']}',
        })
      )
      .pipe(stream)
  },
}

export const snapshotModule =
  (services: Services): ApplicationModule =>
  ({ registerKoaApi }) =>
    registerKoaApi({
      snapshot: async (ctx, next) => {
        const {
          user,
          params: { collection },
        } = ctx
        if (!normalizeRoles(user?.roles).canRunSystemJobs) {
          ctx.throw(HttpStatusCodes.UNAUTHORIZED)
        }
        const handler = snapshotHandlers[collection]
        return handler ? handler(ctx, services) : next()
      },
    })
