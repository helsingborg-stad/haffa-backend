import { join, relative } from 'path'
import { mkdirp } from 'mkdirp'
import { writeFile, unlink } from 'fs/promises'
import send from 'koa-send'
import type { ApplicationContext } from '@helsingborg-stad/gdi-api-node'
import type { FilesService } from '../types'
import { generateFileId, splitBase64DataUri } from '../file-utils'

export const createFsFilesService = (
  folder: string,
  baseUrl = '/api/v1/fs/images'
): FilesService => {
  const tryConvertDataUrlToUrl: FilesService['tryConvertDataUrlToUrl'] =
    async url => {
      const { mimeType, dataBuffer } = splitBase64DataUri(url)

      if (!mimeType || !dataBuffer) {
        return null
      }

      const fileId = generateFileId(mimeType)

      const path = join(folder, fileId)
      await mkdirp(folder)
      await writeFile(path, dataBuffer)
      return `${baseUrl}/${fileId}`
    }

  const tryCreateApplicationModule: FilesService['tryCreateApplicationModule'] =

      () =>
      ({ router }: ApplicationContext) => {
        router.get(`${baseUrl}/:fileId`, async ctx => {
          const {
            params: { fileId },
          } = ctx
          const path = join(folder, fileId)
          try {
            await send(ctx, relative(process.cwd(), path), { hidden: true })
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
    tryCreateApplicationModule,
    tryCleanupUrl,
  }
}
