import { join, relative } from 'path'
import { mkdirp } from 'mkdirp'
import { readFile, writeFile, unlink } from 'fs/promises'
import send from 'koa-send'
import ms from 'ms'
import type { FilesService } from '../types'
import { generateFileId, tryConvertDataUriToImageBuffer } from '../utils'
import { tryConvertUrlToDataUrlForLocalUrlsHelper } from '../utils/image-utils'
import type { ApplicationContext } from '../../lib/gdi-api-node'

// max-age in ms header for transmitted files
const SEND_MAX_AGE = ms('30 days')

export const createFsFilesService = (
  folder: string,
  baseUrl = '/api/v1/fs/images'
): FilesService => {
  const tryConvertDataUrlToUrl: FilesService['tryConvertDataUrlToUrl'] =
    async url => {
      const convertedImage = await tryConvertDataUriToImageBuffer(url)
      if (!convertedImage) {
        return null
      }
      const { mimeType, buffer } = convertedImage

      const fileId = generateFileId(mimeType)

      const path = join(folder, fileId)
      await mkdirp(folder)
      await writeFile(path, buffer)
      return `${baseUrl}/${fileId}`
    }

  const tryConvertUrlToDataUrl: FilesService['tryConvertUrlToDataUrl'] =
    async url =>
      tryConvertUrlToDataUrlForLocalUrlsHelper({
        url,
        baseUrl,
        mimeType: 'image/webp',
        getData: fileId => readFile(join(folder, fileId)),
      })

  const tryCreateApplicationModule: FilesService['tryCreateApplicationModule'] =

      () =>
      ({ router }: ApplicationContext) => {
        router.get(`${baseUrl}/:fileId`, async ctx => {
          const {
            params: { fileId },
          } = ctx
          const path = join(folder, fileId)
          try {
            await send(ctx, relative(process.cwd(), path), {
              hidden: true,
              maxAge: SEND_MAX_AGE,
            })
          } catch {
            // unfortunately, send() exposes to much info on errors
            // so we clear it out
            ctx.body = ''
          }
        })
      }

  const tryCleanupUrl: FilesService['tryCleanupUrl'] = async url => {
    const match = new RegExp(`${baseUrl}/(.*)`).exec(url)
    if (match !== null) {
      const path = join(folder, match[1])
      try {
        await unlink(path)
      } catch {
        // ignore errors and do nothing
      }
    }
  }

  return {
    tryConvertDataUrlToUrl,
    tryConvertUrlToDataUrl,
    tryCreateApplicationModule,
    tryCleanupUrl,
  }
}
