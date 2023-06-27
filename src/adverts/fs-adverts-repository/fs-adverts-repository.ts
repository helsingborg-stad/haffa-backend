import * as uuid from 'uuid'
import { Advert, AdvertsRepository } from '../types'
import { join } from 'path'
import { mkdirp } from 'mkdirp'
import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { createFilterPredicate } from '../filters/create-filter-predicate'
import { mapCreateAdvertInputToAdvert, patchAdvertWithAdvertInput } from '../mappers'

const emptyAdvert: Advert = {
	id: '',
	createdBy: '',
	createdAt: new Date(0).toISOString(),
	modifiedAt: new Date(0).toISOString(),
	title: '',
	description: '',
	images: [],

	unit: '',
	material: '',
	condition: '',
	usage: '',
}

export const createFsAdvertsRepository = (dataFolder: string): AdvertsRepository => {
	const getAdvert: AdvertsRepository['getAdvert'] = async (id: string) => readFile(join(dataFolder, `${id}.json`), { encoding: 'utf8' })
		.then(text => ({
			...emptyAdvert,
			...JSON.parse(text),	
		}))
		.catch(e => null)

	const list: AdvertsRepository['list'] = async (filter) => readdir(dataFolder)
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

	const create: AdvertsRepository['create'] = async (user, input) => {
		const advert = mapCreateAdvertInputToAdvert(input, user)
		const path = join(dataFolder, `${advert.id}.json`)
		await mkdirp(dataFolder)
		await writeFile(path, JSON.stringify(advert), { encoding: 'utf8' })
		return advert
	}
	const update: AdvertsRepository['update'] = async (id, user, input) => {
		const existing = await getAdvert(id)
		if (!existing) {
			return null
		}
		const updated = patchAdvertWithAdvertInput(existing, input)
		const path = join(dataFolder, `${id}.json`)
		await mkdirp(dataFolder)
		await writeFile(path, JSON.stringify(updated), { encoding: 'utf8' })
		return updated
	}


	return {
		getAdvert,
		list,
		create,
		update,
	}
}