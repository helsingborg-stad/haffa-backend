import type { ContentModule, ViewComposition } from './types'

export const createEmptyModule = (): ContentModule => ({
  title: '',
  body: '',
  border: 'true',
  image: '',
  position: 'top',
  width: '100%',
  categories: '',
  tags: '',
  imageRef: '',
})

export const createEmptyComposition = (): ViewComposition => ({
  rows: [],
})

export const extractImages = (composition: ViewComposition) =>
  composition.rows
    .reduce<string[]>(
      (p, n) => [...p, ...n.columns.map(c => c.module.image)],
      []
    )
    .reverse()

export const applyImages = (
  composition: ViewComposition,
  images: Array<string | null>
): ViewComposition => ({
  rows: composition.rows.map(row => ({
    columns: row.columns.map(column => ({
      module: {
        ...column.module,
        image: images.pop() || column.module.image,
      },
    })),
  })),
})

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
