import type { CollationOptions } from 'mongodb'
import type { Advert, AdvertReservations, AdvertsRepository } from '../types'
import type { MongoAdvert } from './types'
import {
  mapAdvertFilterInputToMongoQuery,
  mapAdvertFilterInputToMongoSort,
  mapAdvertToMongoAdvert,
} from './mappers'
import { createEmptyAdvert } from '../mappers'
import type { MongoConnection } from '../../mongodb-utils/types'
import { toMap } from '../../lib'

export const createMongoAdvertsRepository = (
  { getCollection }: MongoConnection<MongoAdvert>,
  collation: CollationOptions
): AdvertsRepository => {
  const getAdvert: AdvertsRepository['getAdvert'] = async (_user, id) =>
    getCollection()
      .then(collection => collection.findOne({ id }))
      .then(envelope => envelope?.advert || null)
      .then(advert => (advert ? { ...createEmptyAdvert(), ...advert } : null))

  const list: AdvertsRepository['list'] = (user, filter) =>
    getCollection().then(collection =>
      collection
        .find(mapAdvertFilterInputToMongoQuery(user, filter))
        .collation(collation)
        .sort(mapAdvertFilterInputToMongoSort(filter))
        .toArray()
        .then(envelopes => envelopes.map(envelope => envelope.advert))
        .then(adverts =>
          adverts.map<Advert>(advert => ({ ...createEmptyAdvert(), ...advert }))
        )
        .then(adverts => ({ adverts }))
    )

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

  const getReservationList: AdvertsRepository['getReservationList'] =
    async filter => {
      const date = (filter.olderThan ?? new Date()).toISOString()

      const cursor = (await getCollection()).aggregate<AdvertReservations>([
        {
          $match: {
            'advert.claims': {
              $elemMatch: {
                at: { $lte: date },
                type: 'reserved',
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
                    { $lte: ['$$claim.at', date] },
                    { $eq: ['$$claim.type', 'reserved'] },
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
    getReservationList,
  }
}
