import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { MongoClient } from 'mongodb';
import type { Collection } from 'mongodb';
import {
  createEmptyAdvert,
} from '../mappers'
import type { Advert, AdvertsRepository } from '../types'
import type { MongoAdvert } from './types';
import { mapAdvertFilterInputToMongoQuery, mapAdvertFilterInputToMongoSort, mapAdvertToMongoAdvert } from './mappers';

const COLLECTION_NAME = 'adverts'

interface MongoDBConnectionConfiguration {
  uri: string
}

interface MongoClientFactory {
  getClient: (config: MongoDBConnectionConfiguration) => Promise<MongoClient>
}

interface MongoConnection {
  collection: Collection<MongoAdvert>
}

const connect = async (
  config: MongoDBConnectionConfiguration,
  clientFactory: MongoClientFactory
): Promise<MongoConnection> => {
  const client = await clientFactory.getClient(config)
  const db = client.db()

  await db
    .collection(COLLECTION_NAME)
    .createIndex({ id: 1 }, { unique: true, name: 'unique_index__id' })
  await db
    .collection(COLLECTION_NAME)
    .createIndex({'advert.title': 'text', 'advert.description': 'text'})

  return {
    collection: db.collection<MongoAdvert>(COLLECTION_NAME),
  }
}

const defaultClientFactory: MongoClientFactory = {
  getClient: ({ uri }) => MongoClient.connect(uri),
}

export const createMongoDBAdvertsRepository = (
  config: MongoDBConnectionConfiguration,
  clientFactory: MongoClientFactory = defaultClientFactory
): AdvertsRepository => {
  const getAdvert: AdvertsRepository['getAdvert'] = (_user, id) =>
    connect(config, clientFactory)
      .then(({ collection }) => collection.findOne({ id }))
      .then(envelope => envelope?.advert || null)

  const list: AdvertsRepository['list'] = (user, filter) =>
    connect(config, clientFactory).then(({ collection }) =>
      collection
        .find(mapAdvertFilterInputToMongoQuery(user, filter))
        .collation({
          locale: 'sv',
          caseLevel: true,
        })
        .sort(mapAdvertFilterInputToMongoSort(filter))
        .toArray()
        .then(envelopes => envelopes.map(envelope => envelope.advert))
        .then(adverts =>
          adverts.map<Advert>(advert => ({ ...createEmptyAdvert(), ...advert }))
        )
    )

  const create: AdvertsRepository['create'] = async (user, advert) => {
    const newDocument = mapAdvertToMongoAdvert(advert)
    const { collection } = await connect(config, clientFactory)
    await collection.insertOne(newDocument)
    return newDocument.advert
  }

  const remove: AdvertsRepository['remove'] = async (user, id) => {
    const existing = await getAdvert(user, id)
    if (!existing) {
      return null
    }
    const { collection } = await connect(config, clientFactory)
    await collection.deleteOne({ id })
    return existing
  }

  const saveAdvertVersion: AdvertsRepository['saveAdvertVersion'] = async (
    user,
    versionId,
    advert
  ) => {
    const { collection } = await connect(config, clientFactory)
    const result = await collection.updateOne({id: advert.id, versionId}, {
      $set: mapAdvertToMongoAdvert(advert)
    }, {upsert: false})

    return result.modifiedCount > 0 ? advert : null
  }

  return {
    getAdvert,
    list,
    create,
    remove,
    saveAdvertVersion,
  }
}

export const tryCreateMongoDBAdvertsRepositoryFromEnv =
  (): AdvertsRepository | null => {
    const uri = getEnv('MONGODB_URI', { fallback: '' })
    return uri ? createMongoDBAdvertsRepository({ uri }) : null
  }
