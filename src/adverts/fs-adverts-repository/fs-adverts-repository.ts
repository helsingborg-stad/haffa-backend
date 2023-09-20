import { join } from 'path'
import { mkdirp } from 'mkdirp'
import { readdir, readFile, stat, unlink, writeFile } from 'fs/promises'
import type {
  AdvertClaim,
  AdvertReservations,
  Advert,
  AdvertsRepository,
} from '../types'
import { createAdvertFilterPredicate } from '../filters/advert-filter-predicate'
import {
  createEmptyAdvert,
  createPagedAdvertList,
  mapCreateAdvertInputToAdvert,
} from '../mappers'
import { createAdvertFilterComparer } from '../filters/advert-filter-sorter'
import { mapValues, toLookup } from '../../lib'

export const createFsAdvertsRepository = (
  dataFolder: string
): AdvertsRepository => {
  const getAdvert: AdvertsRepository['getAdvert'] = async (user, id) =>
    readFile(join(dataFolder, `${id}.json`), { encoding: 'utf8' })
      .then(text => ({
        ...createEmptyAdvert(),
        ...JSON.parse(text),
      }))
      .catch(() => null)

  const list: AdvertsRepository['list'] = async (user, filter) =>
    readdir(dataFolder)
      .then(names => names.filter(name => /.*\.json$/.test(name)))
      .then(names => names.map(name => join(dataFolder, name)))
      .then(paths =>
        Promise.all(paths.map(path => stat(path).then(s => ({ s, path }))))
      )
      .then(stats =>
        Promise.all(
          stats
            .filter(({ s }) => s.isFile())
            .map(({ path }) => readFile(path, { encoding: 'utf8' }))
        )
      )
      .then(texts =>
        texts.map<Advert>(text => ({
          ...createEmptyAdvert(),
          ...JSON.parse(text),
        }))
      )
      .then(adverts =>
        adverts.filter(createAdvertFilterPredicate(user, filter))
      )
      .then(adverts =>
        [...adverts].sort(createAdvertFilterComparer(user, filter))
      )
      .then(adverts => createPagedAdvertList(adverts, filter))
      .catch(e => {
        if (e?.code === 'ENOENT') {
          return { adverts: [], paging: { totalCount: 0 } }
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

  const remove: AdvertsRepository['remove'] = async (user, id) => {
    const existing = await getAdvert(user, id)
    if (existing) {
      const path = join(dataFolder, `${id}.json`)
      await unlink(path)
    }
    return existing
  }

  const saveAdvertVersion: AdvertsRepository['saveAdvertVersion'] = async (
    user,
    versionid,
    advert
  ) => {
    const { id } = advert
    const existing = await getAdvert(user, id)
    if (existing && existing.versionId === versionid) {
      const path = join(dataFolder, `${id}.json`)
      await mkdirp(dataFolder)
      await writeFile(path, JSON.stringify(advert, null, 2), {
        encoding: 'utf8',
      })
      return advert
    }
    return null
  }

  const countBy: AdvertsRepository['countBy'] = async (user, by) =>
    list(user).then(advertList =>
      mapValues(
        toLookup(advertList.adverts, advert => advert[by]),
        l => l.length
      )
    )

  const stats: AdvertsRepository['stats'] = {
    get advertCount() {
      return readdir(dataFolder)
        .then(names => names.filter(name => /.*\.json$/.test(name)))
        .then(names => names.map(name => join(dataFolder, name)))
        .then(paths =>
          Promise.all(paths.map(path => stat(path).then(s => ({ s }))))
        )
        .then(fileStat => Promise.all(fileStat.filter(({ s }) => s.isFile())))
        .then(s => s.length)
        .catch(e => {
          if (e?.code === 'ENOENT') {
            return 0
          }
          throw e
        })
    },
  }
  const getReservationList: AdvertsRepository['getReservationList'] =
    async filter => {
      const dateCompare = (claim: AdvertClaim): boolean =>
        new Date(claim.at) <= (filter.olderThan ?? new Date())

      return readdir(dataFolder)
        .then(names => names.filter(name => /.*\.json$/.test(name)))
        .then(names => names.map(name => join(dataFolder, name)))
        .then(paths =>
          Promise.all(paths.map(path => stat(path).then(s => ({ s, path }))))
        )
        .then(stats =>
          Promise.all(
            stats
              .filter(({ s }) => s.isFile())
              .map(({ path }) => readFile(path, { encoding: 'utf8' }))
          )
        )
        .then(texts =>
          texts.map(text => ({
            ...createEmptyAdvert(),
            ...JSON.parse(text),
          }))
        )
        .then(adverts =>
          adverts.filter(advert => advert.claims.some(dateCompare))
        )
        .then(adverts =>
          adverts.map<AdvertReservations>(advert => ({
            id: advert.id,
            advert: {
              claims: advert.claims.filter(dateCompare),
            },
          }))
        )
        .catch(e => {
          if (e?.code === 'ENOENT') {
            return []
          }
          throw e
        })
    }

  return {
    stats,
    getAdvert,
    saveAdvertVersion,
    list,
    create,
    remove,
    countBy,
    getReservationList,
  }
}
