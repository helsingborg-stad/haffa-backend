import type { ContentModule, ViewComposition } from './types'

export const createEmptyModule = (): ContentModule => ({
  title: '',
  size: 'h6',
  body: '',
  align: 'left',
  border: 'true',
  background: '',
  darkBackground: '',
  color: '',
  darkColor: '',
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

// GraphQL scalars are nullable, so a client can explicitly send `null` for
// any field. `null` overwrites the default when merged with the empty
// module, so it must be coalesced back to the default afterwards.
const sanitizeModule = (module: ContentModule): ContentModule =>
  Object.fromEntries(
    Object.entries(createEmptyModule()).map(([key, defaultValue]) => [
      key,
      (module as Record<string, unknown>)[key] ?? defaultValue,
    ])
  ) as ContentModule

export const normalizeComposition = (
  composition?: ViewComposition
): ViewComposition => ({
  rows: (composition?.rows ?? []).map(row => ({
    columns: (row.columns ?? []).map(column => ({
      module: sanitizeModule({
        ...createEmptyModule(),
        ...column.module,
      }),
    })),
  })),
})
