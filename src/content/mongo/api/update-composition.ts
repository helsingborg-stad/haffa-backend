import type { MongoConnection } from '../../../mongodb-utils/types'
import type { MongoViewComposition } from '../types'
import type { ContentRepository } from '../../types'
import { applyImages, extractImages, normalizeComposition } from '../../mappers'
import type { Services } from '../../../types'

export const createUpdateComposition =
  (
    { getCollection }: MongoConnection<MongoViewComposition>,
    { files }: Pick<Services, 'files'>
  ): ContentRepository['updateComposition'] =>
  async input => {
    const collection = await getCollection()
    const cPage = await collection.findOne({ id: 'HOME' })
    const nPage = normalizeComposition(input)

    // Add new images
    const nImageList = await Promise.all(
      extractImages(nPage).map(
        async img => (await files.tryConvertDataUrlToUrl(img)) || img
      )
    )
    const composition = applyImages(nPage, nImageList)

    // Delete removed images
    const cImageList = cPage ? extractImages(cPage.composition) : []

    const deletableFiles = cImageList
      .reduce<Array<string | null>>(
        (p, c) => [...p, nImageList.includes(c) ? null : c],
        []
      )
      .filter(v => v) as string[]
    await Promise.all(deletableFiles.map(img => files.tryCleanupUrl(img)))

    // Update document
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
