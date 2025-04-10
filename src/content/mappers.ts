import type { ContentModule, ViewComposition } from './types'

export const createEmptyModule = (): ContentModule => ({
  title: '',
  size: 'h6',
  body: '',
  align: 'left',
  border: 'true',
  background: '',
  color: '',
  image: '',
  alt: '',
  position: 'top',
  width: '100%',
  categories: '',
  tags: '',
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
