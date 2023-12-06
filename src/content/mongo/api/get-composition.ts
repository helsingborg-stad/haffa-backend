import type { MongoConnection } from '../../../mongodb-utils/types'
import { normalizeComposition } from '../../mappers'
import type { ContentRepository } from '../../types'
import type { MongoViewComposition } from '../types'

export const createGetComposition =
  ({
    getCollection,
  }: MongoConnection<MongoViewComposition>): ContentRepository['getComposition'] =>
  async () => {
    const collection = await getCollection()
    const find = await collection.findOne({
      id: 'HOME',
    })
    return normalizeComposition(find?.composition)
  }
