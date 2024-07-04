import type { CollationOptions } from 'mongodb'
import { PassThrough } from 'stream'
import type { Advert, AdvertList, AdvertsRepository } from '../../types'
import type { MongoAdvert } from './types'
import {
  mapAdvertFilterInputToMongoQuery,
  mapAdvertFilterInputToMongoSort,
  mapAdvertToMongoAdvert,
} from './mappers'
import { createEmptyAdvert, createEmptyAdvertLocation } from '../../mappers'
import type { MongoConnection } from '../../../mongodb-utils/types'
import { toMap } from '../../../lib'
import { convertObjectStream } from '../../../lib/streams'
import { createValidatingAdvertsRepository } from '../validation'

export const createMongoAdvertsRepository = (
  { getCollection }: MongoConnection<MongoAdvert>,
  collation: CollationOptions
): AdvertsRepository => {
  const getAdvert: AdvertsRepository['getAdvert'] = async (_user, id) =>
    getCollection()
      .then(collection => collection.findOne({ id }))
      .then(envelope => envelope?.advert || null)
      .then(advert =>
        advert
          ? {
              ...createEmptyAdvert(),
              ...advert,
              location: {
                ...createEmptyAdvertLocation(),
                ...advert.location,
              },
            }
          : null
      )

  const list: AdvertsRepository['list'] = async (user, filter) => {
    const collection = await getCollection()
    const query = mapAdvertFilterInputToMongoQuery(user, filter)
    const totalCount = await collection.countDocuments(query)
    const getInt = (v: any, d: number, max: number) =>
      v > 0 && v <= max ? Math.ceil(v) : d

    const pageSize = getInt(filter?.paging?.pageSize, 25, 100)
    const pageCount = Math.ceil(totalCount / pageSize)
    const pageIndex = getInt(
      filter?.paging?.pageIndex,
      0,
      Math.max(pageCount - 1, 0)
    )

    const useCursor = (filter?.paging?.limit || 0) > 0
    const { skip, take } = useCursor
      ? {
          skip: Math.max(0, parseInt(filter?.paging?.cursor || '0', 10) || 0),
          take: filter?.paging?.limit || 0 + 1,
        }
      : {
          skip: pageIndex * pageSize,
          take: pageSize,
        }

    const adverts = await collection
      .find(query)
      .collation(collation)
      .sort(mapAdvertFilterInputToMongoSort(filter))
      .limit(take)
      .skip(skip)
      .toArray()
      .then(envelopes => envelopes.map(envelope => envelope.advert))
      .then(mongoAdvert =>
        mongoAdvert.map<Advert>(advert => ({
          ...createEmptyAdvert(),
          ...advert,
        }))
      )

    return <AdvertList>{
      adverts,
      paging: {
        totalCount,
        pageCount,
        pageIndex,
        pageSize,
        nextCursor:
          totalCount > skip + take ? (skip + take).toString() : undefined,
      },
    }
  }

  const create: AdvertsRepository['create'] = async (user, advert) =>
    getCollection()
      .then(collection => ({
        collection,
        mongoAdvert: mapAdvertToMongoAdvert(advert),
      }))
      .then(({ collection, mongoAdvert }) =>
        collection.insertOne(mongoAdvert).then(() => mongoAdvert.advert)
      )

  const remove: AdvertsRepository['remove'] = async (user, id) => {
    const existing = await getAdvert(user, id)
    if (existing) {
      const collection = await getCollection()
      await collection.deleteOne({ id })
    }
    return existing
  }

  const saveAdvertVersion: AdvertsRepository['saveAdvertVersion'] = async (
    user,
    versionId,
    advert
  ) => {
    const collection = await getCollection()
    const result = await collection.updateOne(
      { id: advert.id, versionId },
      {
        $set: mapAdvertToMongoAdvert(advert),
      },
      { upsert: false }
    )

    return result.modifiedCount > 0 ? advert : null
  }

  const countBy: AdvertsRepository['countBy'] = async (
    user,
    by,
    excludeArchived
  ) => {
    // https://www.mongodb.com/docs/manual/reference/operator/aggregation/count-accumulator/#use-in--group-stage
    const collection = await getCollection()
    const cursor = collection.aggregate<{ _id: string; c: number }>(
      [
        excludeArchived
          ? {
              $match: { 'meta.archived': { $ne: true } },
            }
          : null,
        {
          $group: {
            _id: `$advert.${by}`,
            c: {
              // NOTE: $count operator doesnt work on Mongo 4.*. $sum: 1 i equivalent
              // https://www.mongodb.com/docs/manual/reference/operator/aggregation/count-accumulator/#mongodb-group-grp.-count
              $sum: 1,
            },
          },
        },
      ]
        .filter(v => v)
        .map(v => v!)
    )
    const rows = await cursor.toArray()
    return toMap(
      rows,
      ({ _id }) => _id,
      ({ c }) => c
    )
  }

  const stats: AdvertsRepository['stats'] = {
    get advertCount() {
      return getCollection().then(c => c.countDocuments())
    },
  }

  const getAdvertsByClaimStatus: AdvertsRepository['getAdvertsByClaimStatus'] =
    async filter =>
      getCollection()
        .then(collection =>
          collection.find({
            'advert.claims': {
              $elemMatch: { type: filter.type },
            },
          })
        )
        .then(d => d.project({ _id: 0, id: 1 }))
        .then(v => v.toArray())
        .then(i => i.map(r => r.id))

  const getSnapshot: AdvertsRepository['getSnapshot'] = () => {
    const result = new PassThrough({ objectMode: true })
    getCollection()
      .then(collection => collection.find().stream())
      .then(stream =>
        stream
          .pipe(
            convertObjectStream<MongoAdvert, Advert>(
              async ({ advert }) => advert
            )
          )
          .pipe(result)
      )
      .catch(error => result.emit('error', error))
    return result
  }

  const getReservableAdvertsWithWaitlist: AdvertsRepository['getReservableAdvertsWithWaitlist'] =
    () =>
      getCollection()
        .then(collection =>
          collection.find({
            'advert.waitlist.0': { $exists: true },
            'meta.unreservedCount': { $gt: 0 },
          })
        )
        .then(d => d.project({ _id: 0, id: 1 }))
        .then(v => v.toArray())
        .then(i => i.map(r => r.id))

  return createValidatingAdvertsRepository({
    stats,
    getAdvert,
    list,
    create,
    remove,
    saveAdvertVersion,
    countBy,
    getAdvertsByClaimStatus,
    getSnapshot,
    getReservableAdvertsWithWaitlist,
  })
}
