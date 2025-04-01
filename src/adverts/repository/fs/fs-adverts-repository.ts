import { join } from 'path'
import { mkdirp } from 'mkdirp'
import { readdir, readFile, stat, unlink, writeFile } from 'fs/promises'
import type { AdvertClaim, Advert, AdvertsRepository } from '../../types'
import { createAdvertFilterPredicate } from '../../filters/advert-filter-predicate'
import {
  createEmptyAdvert,
  createEmptyAdvertLocation,
  createPagedAdvertList,
  mapCreateAdvertInputToAdvert,
  normalizeAdvertSummaries,
} from '../../mappers'
import { createAdvertFilterComparer } from '../../filters/advert-filter-sorter'
import { mapValues, toLookup } from '../../../lib'
import { objectStream } from '../../../lib/streams'
import { createValidatingAdvertsRepository } from '../validation'
import type { GetAdvertMeta } from '../../advert-meta/types'

const notFundHandler =
  <T>(errorValue: T) =>
  (e: any) => {
    if (e?.code === 'ENOENT') {
      return errorValue
    }
    throw e
  }

const findPaths = async (folder: string): Promise<string[]> =>
  readdir(folder)
    .then(names => names.filter(name => /.*\.json$/.test(name)))
    .then(names => names.map(name => join(folder, name)))
    .then(paths =>
      Promise.all(
        paths.map(path =>
          stat(path)
            .catch(notFundHandler(null))
            .then(s => ({ s, path }))
        )
      )
    )
    .then(l =>
      Promise.all(l.filter(({ s }) => s && s.isFile()).map(({ path }) => path))
    )
    .catch(notFundHandler([]))

export const createFsAdvertsRepository = (
  dataFolder: string,
  getAdvertMeta: GetAdvertMeta
): AdvertsRepository => {
  const scan = (): Promise<Advert[]> =>
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
        texts.map<Advert>(text => {
          const json = JSON.parse(text)
          return {
            ...createEmptyAdvert(),
            ...json,
            location: {
              ...createEmptyAdvertLocation(),
              ...json.location,
            },
          }
        })
      )

  const getAdvert: AdvertsRepository['getAdvert'] = async (user, id) =>
    readFile(join(dataFolder, `${id}.json`), { encoding: 'utf8' })
      .then(text => JSON.parse(text))
      .then(json => ({
        ...createEmptyAdvert(),
        ...json,
        location: {
          ...createEmptyAdvertLocation(),
          ...json.location,
        },
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
        texts.map<Advert>(text => {
          const json = JSON.parse(text)
          return {
            ...createEmptyAdvert(),
            ...json,
            location: {
              ...createEmptyAdvertLocation(),
              ...json.location,
            },
          }
        })
      )
      .then(adverts =>
        adverts.filter(createAdvertFilterPredicate(user, getAdvertMeta, filter))
      )
      .then(adverts =>
        [...adverts].sort(createAdvertFilterComparer(user, filter))
      )
      .then(adverts => createPagedAdvertList(adverts, filter))
      .catch(e => {
        if (e?.code === 'ENOENT') {
          return {
            adverts: [],
            paging: {
              totalCount: 0,
              pageSize: 1,
              pageIndex: 0,
              pageCount: 0,
            },
          }
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

  const countBy: AdvertsRepository['countBy'] = async (
    user,
    by,
    excludeArchived
  ) =>
    list(user).then(advertList =>
      mapValues(
        toLookup(
          advertList.adverts.filter(a =>
            excludeArchived ? !a.archivedAt : true
          ),
          advert => advert[by]
        ),
        l => l.length
      )
    )

  const getAdvertsByClaimStatus: AdvertsRepository['getAdvertsByClaimStatus'] =
    async filter => {
      const compare = (claim: AdvertClaim): boolean =>
        claim.type === filter.type

      return readdir(dataFolder)
        .then(names => names.filter(name => /.*\.json$/.test(name)))
        .then(names => names.map(name => join(dataFolder, name)))
        .then(paths =>
          Promise.all(paths.map(path => stat(path).then(s => ({ s, path }))))
        )
        .then(fileStat =>
          Promise.all(
            fileStat
              .filter(({ s }) => s.isFile())
              .map(({ path }) => readFile(path, { encoding: 'utf8' }))
          )
        )
        .then(texts =>
          texts.map<Advert>(text => {
            const json = JSON.parse(text)
            return {
              ...createEmptyAdvert(),
              ...json,
              location: {
                ...createEmptyAdvertLocation(),
                ...json.location,
              },
            }
          })
        )
        .then(adverts => adverts.filter(advert => advert.claims.some(compare)))
        .then(adverts => adverts.map(advert => advert.id))
        .catch(notFundHandler([]))
    }

  const getSnapshot: AdvertsRepository['getSnapshot'] = () =>
    objectStream(
      () => findPaths(dataFolder),
      path =>
        readFile(path, { encoding: 'utf-8' })
          .then(JSON.parse)
          .catch(notFundHandler(null))
    )
  const getReservableAdvertsWithWaitlist: AdvertsRepository['getReservableAdvertsWithWaitlist'] =
    () =>
      scan().then(adverts =>
        adverts
          .filter(({ waitlist }) => waitlist.length > 0)
          .filter(
            ({ quantity, claims }) =>
              quantity > claims.map(c => c.quantity).reduce((s, q) => s + q, 0)
          )
          .map(({ id }) => id)
      )
  const getAdvertFigures: AdvertsRepository['getAdvertSummaries'] =
    async () => {
      const adverts = (await scan()).filter(a => !a.archivedAt)

      return normalizeAdvertSummaries({
        totalLendingAdverts: adverts.filter(v => v.lendingPeriod).length,
        totalRecycleAdverts: adverts.filter(v => !!v.lendingPeriod).length,
        availableLendingAdverts: adverts.filter(
          v => !!v.lendingPeriod && v.claims.length === 0
        ).length,
        availableRecycleAdverts: adverts.filter(
          v => !v.lendingPeriod && v.quantity > 0
        ).length,
        totalAdverts: adverts.length,
        reservedAdverts: adverts.filter(
          v => v.claims?.some(c => c.type === 'reserved') ?? 0
        ).length,
        collectedAdverts: adverts.filter(
          v => v.claims?.some(c => c.type === 'collected') ?? 0
        ).length,
      })
    }

  return createValidatingAdvertsRepository({
    getAdvert,
    saveAdvertVersion,
    list,
    create,
    remove,
    countBy,
    getAdvertsByClaimStatus,
    getSnapshot,
    getReservableAdvertsWithWaitlist,
    getAdvertSummaries: getAdvertFigures,
  })
}
