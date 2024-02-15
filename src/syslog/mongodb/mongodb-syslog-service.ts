import { createMongoConnection } from '../../mongodb-utils'
import type {
  MongoConnection,
  MongoConnectionOptions,
} from '../../mongodb-utils/types'
import { sanitizeSyslogEntry, sanitizeSyslogFilter } from '../mappers'
import type { SyslogEntry, SyslogFilter, SyslogService } from '../types'

export const createMongoSyslogConnection = ({
  uri,
  collectionName,
}: Pick<
  MongoConnectionOptions<SyslogEntry>,
  'uri' | 'collectionName'
>): MongoConnection<SyslogEntry> =>
  createMongoConnection({
    uri,
    collectionName,
  })

const buildMongoFilter = (filter: SyslogFilter) => {
  let date: any
  if (filter.from) {
    date = {
      ...date,
      $gte: filter.from,
    }
  }
  if (filter.to) {
    date = {
      ...date,
      $lte: filter.to,
    }
  }
  const at = date
    ? {
        at: date,
      }
    : undefined

  const severity: any = {}
  if (filter.severity) {
    severity[severity] = filter.severity
  }

  const type: any = {}
  if (filter.type) {
    type.type = filter.type
  }

  return {
    ...at,
    ...severity,
    ...type,
  }
}

export const createMongoSyslogService = ({
  getCollection,
}: MongoConnection<SyslogEntry>): SyslogService => ({
  read: async filter => {
    const f = sanitizeSyslogFilter(filter)
    return getCollection()
      .then(collection =>
        collection.find(buildMongoFilter(f), {
          sort: {
            at: -1,
          },
        })
      )
      .then(docs => docs.skip(f.skip).limit(f.limit))
      .then(docs => docs.toArray())
      .then(docs => docs.map(d => sanitizeSyslogEntry(d)))
  },

  write: async entry => {
    const e = sanitizeSyslogEntry(entry)
    return getCollection()
      .then(collection => collection.insertOne(e))
      .then(() => e)
  },

  prune: async filter => {
    const f = sanitizeSyslogFilter(filter)
    return getCollection()
      .then(collection => collection.deleteMany(buildMongoFilter(f)))
      .then(result => result.deletedCount)
  },
})
