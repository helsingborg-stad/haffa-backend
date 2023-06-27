import { Advert, AdvertsRepository } from '../types'
import { join } from 'path'
import { mkdirp } from 'mkdirp'
import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { createFilterPredicate } from '../filters/create-filter-predicate'

const emptyAdvert: Advert = {
	id: '',
	createdBy: '',
	createdAt: new Date(0).toISOString(),
	modifiedAt: new Date(0).toISOString(),
	title: '',
	description: '',
	
	unit: '',
	material: '',
	condition: '',
	usage: '',
}

export const createFsAdvertsRepository = (dataFolder: string): AdvertsRepository => {
	return {
		getAdvert: (id) => readFile(join(dataFolder, `${id}.json`), { encoding: 'utf8' })
			.then(text => ({
				...emptyAdvert,
				...JSON.parse(text),	
			}))
			.catch(e => null),
		list: (filter) => readdir(dataFolder)
			.then(names => names.filter(name => /.*\.json$/.test(name)))
			.then(names => names.map(name => join(dataFolder, name)))
			.then(paths => Promise.all(paths.map(path => stat(path).then(stat => ({ stat, path })))))
			.then(stats => Promise.all(stats
				.filter(({ stat }) => stat.isFile()).map(({ path }) => readFile(path, { encoding: 'utf8' }) )))
			.then(texts => texts.map(text => ({
				...emptyAdvert,
				...JSON.parse(text),
			})))
			.then(adverts => adverts.filter(createFilterPredicate(filter)))
			.catch(e => {
				console.log(e)
				if (e?.code === 'ENOENT') {
					return []
				}
				throw e
			})
		,
		create: async (advert) =>  {
			const path = join(dataFolder, `${advert.id}.json`)
			await mkdirp(dataFolder)
			await writeFile(path, JSON.stringify(advert), { encoding: 'utf8' })
			return advert
		},
	}
}