import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { Collection, MongoClient } from 'mongodb'
import { createAdvertFilterPredicate } from '../filters/advert-filter-predicate'
import { createAdvertFilterComparer } from '../filters/advert-filter-sorter'
import {
  createEmptyAdvert,
  mapCreateAdvertInputToAdvert,
  patchAdvertWithAdvertInput,
} from '../mappers'
import type { Advert, AdvertsRepository } from '../types'

const COLLECTION_NAME = 'adverts'

interface MongoDBConnectionConfiguration {
  uri: string
}

interface MongoClientFactory {
  getClient: (config: MongoDBConnectionConfiguration) => Promise<MongoClient>
}

interface MongoConnection {
  collection: Collection<Advert>
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

  return {
    collection: db.collection<Advert>(COLLECTION_NAME),
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
    connect(config, clientFactory).then(({ collection }) =>
      collection.findOne({ id })
    )

  const list: AdvertsRepository['list'] = (user, filter) =>
    connect(config, clientFactory).then(({ collection }) =>
      collection
        .find({})
        .toArray()
        .then(adverts =>
          adverts.map<Advert>(advert => ({ ...createEmptyAdvert(), ...advert }))
        )
        .then(adverts =>
          adverts.filter(createAdvertFilterPredicate(user, filter))
        )
        .then(adverts =>
          [...adverts].sort(createAdvertFilterComparer(user, filter))
        )
    )

  const create: AdvertsRepository['create'] = async (user, input) => {
    const newDocument = mapCreateAdvertInputToAdvert(input, user)
    const { collection } = await connect(config, clientFactory)
    await collection.insertOne({ ...newDocument, lastOp: 'create' } as Advert)
    return newDocument
  }

  const update: AdvertsRepository['update'] = async (user, id, input) => {
    const existing = await getAdvert(user, id)
    if (!existing) {
      return null
    }
    const updated = patchAdvertWithAdvertInput(existing, input)

    const { collection } = await connect(config, clientFactory)
    await collection.updateOne({ id: existing.id }, updated)
    return updated
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
    const { id } = advert
    const existing = await getAdvert(user, id)
    if (existing && existing.versionId === versionId) {
      const { collection } = await connect(config, clientFactory)
      const result = await collection.replaceOne(
        { id, versionId },
        {
          ...advert,
          modifiedAt: new Date().toISOString(),
        }
      )

      if (result.modifiedCount == 0) {
        return null
      }

      return advert
    }
    return null
  }

  return {
    getAdvert,
    list,
    create,
    update,
    remove,
    saveAdvertVersion,
  }
}

export const tryCreateMongoDBAdvertsRepositoryFromEnv =
  (): AdvertsRepository | null => {
    const uri = getEnv('MONGODB_URI', { fallback: '' })
    return uri ? createMongoDBAdvertsRepository({ uri }) : null
  }
