import { randomUUID } from 'crypto'
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
})
