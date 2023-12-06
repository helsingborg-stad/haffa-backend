import type { FilesService } from '../files/types'
import type { ContentModule, ViewComposition } from './types'

export const createEmptyModule = (): ContentModule => ({
  title: '',
  body: '',
  image: '',
  categories: '',
  tags: '',
})

export const createEmptyComposition = (): ViewComposition => ({
  rows: [],
})

export const convertImages = async (
  composition: ViewComposition,
  files: FilesService
): Promise<ViewComposition> => {
  const images = composition.rows.reduce<string[]>(
    (p, n) => [...p, ...n.columns.map(c => c.module.image)],
    []
  )
  const fileset = await Promise.all(
    images.map(image => files.tryConvertDataUrlToUrl(image))
  )
  fileset.reverse()

  return {
    rows: composition.rows.map(row => ({
      columns: row.columns.map(column => ({
        module: {
          ...column.module,
          image: fileset.pop() || column.module.image,
        },
      })),
    })),
  }
}

export const normalizeComposition = (
  composition?: ViewComposition
): ViewComposition => ({
  rows: (composition?.rows ?? []).map(row => ({
    columns: (row.columns ?? []).map(column => ({
      module: {
        ...createEmptyModule(),
        ...column.module,
      },
    })),
  })),
})
