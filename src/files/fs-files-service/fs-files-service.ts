import * as uuid from 'uuid'
import { join, relative } from 'path'
import { mkdirp } from 'mkdirp'
import { extension } from 'mime-types'
import { FilesService } from '../types'
import { writeFile } from 'fs/promises'
import send from 'koa-send'
import { ApplicationContext } from '@helsingborg-stad/gdi-api-node'

export const createFsFilesService = (folder: string, baseUrl = '/api/v1/fs/images'): FilesService => {
	const tryConvertDataUrlToUrl: FilesService['tryConvertDataUrlToUrl'] = async (url) => {
		const [ , mimeType = '', base64encoding = '' ] = /^data:([^;]*);base64,(.+$)$/m.exec(url) || []

		if (!base64encoding) {
			return null
		}
		const buffer = Buffer.from(base64encoding, 'base64')

		const id = uuid.v4().split('-').join('')
		const ext = extension(mimeType)
		const fileId = ext ? `${id}.${ext}` : id
		const path = join(folder, fileId)
		await mkdirp(folder)
		await writeFile(path, buffer)
		return `${baseUrl}/${fileId}`
	}
	
	const tryCreateApplicationModule: FilesService['tryCreateApplicationModule'] = () => ({ router }: ApplicationContext) => {
		router.get(
			`${baseUrl}/:fileId`,
			async ctx => {
				const { params: { fileId } } = ctx
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

	return {
		tryConvertDataUrlToUrl,
		tryCreateApplicationModule,
	}
}