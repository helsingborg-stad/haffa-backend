import { randomUUID } from 'crypto'
import type { Filter } from 'mongodb'
import type { MongoConnection } from '../../mongodb-utils/types'
import type { EventLogService } from '../types'
import type { MongoEvent } from './types'

export const createMongoEventLogService = ({
  getCollection,
}: MongoConnection<MongoEvent>): EventLogService => ({
  logEvent: async event => {
    const collection = await getCollection()
    await collection.insertOne({
      id: randomUUID().split('-').join(''),
      event,
    })
  },
  getEvents: async ({ from, to, advertId }) => {
    const collection = await getCollection()
    const cursor = collection.find({
      $and: [
        from && { 'event.at': { $gte: from.toISOString() } },
        to && { 'event.at': { $lte: to.toISOString() } },
        advertId && { 'event.advertId': advertId },
      ].filter(v => v),
    } as Filter<MongoEvent>)

    const result = (await cursor.toArray()).map(e => e.event)
    await cursor.close()
    return result
  },
  enumerate: async ({ from, to }, inspect) => {
    const collection = await getCollection()
    const cursor = collection.find({
      $and: [
        from && { 'event.at': { $gte: from.toISOString() } },
        to && { 'event.at': { $lte: to.toISOString() } },
      ].filter(v => v),
    } as Filter<MongoEvent>)

    const wrapInspect = async (e: MongoEvent | null) =>
      e && e.event ? inspect(e.event) : true

    // eslint-disable-next-line no-await-in-loop
    while (
      // eslint-disable-next-line no-await-in-loop
      (await cursor.hasNext()) &&
      // eslint-disable-next-line no-await-in-loop
      (await wrapInspect(await cursor.next()))
    ) {
      /* empty */
    }
    await cursor.close()
  },
})
