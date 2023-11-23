import type { CollationOptions } from 'mongodb'
import type {
  Advert,
  AdvertList,
  AdvertReservations,
  AdvertsRepository,
} from '../../types'
import type { MongoAdvert } from './types'
import {
  mapAdvertFilterInputToMongoQuery,
  mapAdvertFilterInputToMongoSort,
  mapAdvertToMongoAdvert,
} from './mappers'
import { createEmptyAdvert } from '../../mappers'
import type { MongoConnection } from '../../../mongodb-utils/types'
import { toMap } from '../../../lib'

export const createMongoAdvertsRepository = (
  { getCollection }: MongoConnection<MongoAdvert>,
  collation: CollationOptions
): AdvertsRepository => {
  const getAdvert: AdvertsRepository['getAdvert'] = async (_user, id) =>
    getCollection()
      .then(collection => collection.findOne({ id }))
      .then(envelope => envelope?.advert || null)
      .then(advert => (advert ? { ...createEmptyAdvert(), ...advert } : null))

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

  const countBy: AdvertsRepository['countBy'] = async (user, by) => {
    // https://www.mongodb.com/docs/manual/reference/operator/aggregation/count-accumulator/#use-in--group-stage
    const collection = await getCollection()
    const cursor = collection.aggregate<{ _id: string; c: number }>([
      {
        $group: {
          _id: `$advert.${by}`,
          c: {
            $count: {},
          },
        },
      },
    ])
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

  const getAggregatedClaims: AdvertsRepository['getAggregatedClaims'] =
    async filter => {
      const cursor = (await getCollection()).aggregate<AdvertReservations>([
        {
          $match: {
            'advert.claims': {
              $elemMatch: {
                at: { $lte: filter.before.toISOString() },
                type: filter.type,
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            'advert.claims': {
              $filter: {
                input: '$advert.claims',
                as: 'claim',
                cond: {
                  $and: [
                    { $lte: ['$$claim.at', filter.before.toISOString()] },
                    { $eq: ['$$claim.type', filter.type] },
                  ],
                },
              },
            },
          },
        },
      ])
      return cursor.toArray()
    }

  return {
    stats,
    getAdvert,
    list,
    create,
    remove,
    saveAdvertVersion,
    countBy,
    getAggregatedClaims,
  }
}
