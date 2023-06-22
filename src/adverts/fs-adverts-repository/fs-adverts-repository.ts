import * as uuid from 'uuid'
import { Advert, AdvertsRepository } from '../types'
import { join } from 'path'
import { mkdirp } from 'mkdirp'
import { readdir, readFile, stat, writeFile } from 'fs/promises'

const emptyAdvert: Advert = {
	id: '',
	title: '',
	description: '',
}

export const createFsAdvertsRepository = (dataFolder: string): AdvertsRepository => {
	return {
		getAdvert: (id) => readFile(join(dataFolder, `${id}.json`), { encoding: 'utf8' })
			.then(text => ({
				...emptyAdvert,
				...JSON.parse(text),	
			}))
			.catch(e => null),
		list: () => readdir(dataFolder)
			.then(names => names.filter(name => /.*\.json$/.test(name)))
			.then(names => names.map(name => join(dataFolder, name)))
			.then(paths => Promise.all(paths.map(path => stat(path).then(stat => ({ stat, path })))))
			.then(stats => Promise.all(stats
				.filter(({ stat }) => stat.isFile()).map(({ path }) => readFile(path, { encoding: 'utf8' }) )))
			.then(texts => texts.map(text => ({
				...emptyAdvert,
				...JSON.parse(text),
			})))
			.catch(e => {
				console.log(e)
				if (e?.code === 'ENOENT') {
					return []
				}
				throw e
			})
		,
		create: async (advert) =>  {
			const a = { ...advert, id: uuid.v4().replace(/-/, '') }
			const path = join(dataFolder, `${a.id}.json`)
			await mkdirp(dataFolder)
			await writeFile(path, JSON.stringify(a), { encoding: 'utf8' })
			return a
		},

	}
}