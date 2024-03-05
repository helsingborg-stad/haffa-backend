import { PassThrough } from 'stream'
import type { Advert } from '../adverts/types'
import type { FilesService } from '../files/types'
import { convertObjectStream, jsonStream } from '../lib/streams'
import type { ImportSnapshotFunction, SnapshotFunction } from './types'
import { createAdvertMutations } from '../adverts/advert-mutations'
import { waitForAll } from '../lib'
import { validateAdvert } from '../adverts/repository/validation'

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

export const advertsSnapshot: SnapshotFunction = (ctx, { adverts, files }) => {
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
}

export const importAdvertsSnapshot: ImportSnapshotFunction = async (
  user,
  services,
  data
) => {
  const mutations = createAdvertMutations(services)
  const adverts = data as Advert[]

  return waitForAll(adverts.map(validateAdvert), advert =>
    mutations.importAdvertSnapshot(user, advert)
  )
}
