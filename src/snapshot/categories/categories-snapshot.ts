import { PassThrough } from 'stream'
import type { ImportSnapshotFunction, SnapshotFunction } from '../types'
import { jsonStream, objectStream } from '../../lib/streams'
import type { Category } from '../../categories/types'
import { patchCategories } from './patch-categories'

export const categoriesSnapshot: SnapshotFunction = (ctx, { categories }) => {
  const stream = new PassThrough()
  ctx.type = 'application/json'
  ctx.body = stream

  objectStream<Category, Category>(
    () => categories.getCategories(),
    async c => c
  )
    .pipe(
      jsonStream({
        prefix: '{"snapshot": "categories", "categories": [',
        separator: ',',
        terminator: ']}',
      })
    )
    .pipe(stream)
}

export const importCategoriesSnapshot: ImportSnapshotFunction = async (
  user,
  { categories },
  data
) => {
  const patched = patchCategories(await categories.getCategories(), data)
  return categories.updateCategories(patched)
}
