import { join } from 'path'
import { mkdirp } from 'mkdirp'
import { readdir, readFile, stat, unlink, writeFile } from 'fs/promises'
import type { AdvertsRepository } from '../types'
import { createAdvertFilterPredicate } from '../filters/advert-filter-predicate'
import { createEmptyAdvert, mapCreateAdvertInputToAdvert, patchAdvertWithAdvertInput } from '../mappers'

export const createFsAdvertsRepository = (dataFolder: string): AdvertsRepository => {
	const getAdvert: AdvertsRepository['getAdvert'] = async (user, id) => readFile(join(dataFolder, `${id}.json`), { encoding: 'utf8' })
		.then(text => ({
			...createEmptyAdvert(),
			...JSON.parse(text),	
		}))
		.catch(() => null)

	const list: AdvertsRepository['list'] = async (user, filter) => readdir(dataFolder)
		.then(names => names.filter(name => /.*\.json$/.test(name)))
		.then(names => names.map(name => join(dataFolder, name)))
		.then(paths => Promise.all(paths.map(path => stat(path).then(s => ({ s, path })))))
		.then(stats => Promise.all(stats
			.filter(({ s }) => s.isFile()).map(({ path }) => readFile(path, { encoding: 'utf8' }) )))
		.then(texts => texts.map(text => ({
			...createEmptyAdvert(),
			...JSON.parse(text),
		})))
		.then(adverts => adverts.filter(createAdvertFilterPredicate(user, filter)))
		.catch(e => {
			if (e?.code === 'ENOENT') {
				return []
			}
			throw e
		})

	const create: AdvertsRepository['create'] = async (user, input) => {
		const advert = mapCreateAdvertInputToAdvert(input, user)
		const path = join(dataFolder, `${advert.id}.json`)
		await mkdirp(dataFolder)
		await writeFile(path, JSON.stringify(advert, null, 2), { encoding: 'utf8' })
		return advert
	}
	
	const update: AdvertsRepository['update'] = async (user, id, input) => {
		const existing = await getAdvert(user, id)
		if (!existing) {
			return null
		}
		const updated = patchAdvertWithAdvertInput(existing, input)
		const path = join(dataFolder, `${id}.json`)
		await mkdirp(dataFolder)
		await writeFile(path, JSON.stringify(updated, null, 2), { encoding: 'utf8' })
		return updated
	}

	const remove: AdvertsRepository['remove'] = async (user, id) => {
		const existing = await getAdvert(user, id)
		if (existing) {
			const path = join(dataFolder, `${id}.json`)
			await unlink(path)
		}
		return existing
	}

	const saveAdvertVersion: AdvertsRepository['saveAdvertVersion'] = async (user, versionid, advert) => {
		const { id } = advert
		const existing = await getAdvert(user, id)
		if (existing && (existing.versionId === versionid)) {
			const path = join(dataFolder, `${id}.json`)
			await mkdirp(dataFolder)
			await writeFile(path, JSON.stringify(advert, null, 2), { encoding: 'utf8' })
			return advert
		}
		return null
	}


	return {
		getAdvert,
		saveAdvertVersion,
		list,
		create,
		update,
		remove
	}
}