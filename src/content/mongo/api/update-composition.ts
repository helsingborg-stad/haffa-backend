import type { MongoConnection } from '../../../mongodb-utils/types'
import type { MongoViewComposition } from '../types'
import type { ContentRepository } from '../../types'
import { convertImages, normalizeComposition } from '../../mappers'
import type { Services } from '../../../types'

export const createUpdateComposition =
  (
    { getCollection }: MongoConnection<MongoViewComposition>,
    { files }: Pick<Services, 'files'>
  ): ContentRepository['updateComposition'] =>
  async input => {
    const collection = await getCollection()
    const composition = await convertImages(normalizeComposition(input), files)

    await collection.updateOne(
      {
        id: 'HOME',
      },
      {
        $set: {
          composition,
        },
      },
      { upsert: true }
    )
    return composition
  }
