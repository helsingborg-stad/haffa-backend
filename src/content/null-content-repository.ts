import { createEmptyComposition } from './mappers'
import type { ContentRepository } from './types'

export const createNullContentRepository = (): ContentRepository => ({
  getComposition: async () => createEmptyComposition(),
  updateComposition: async () => createEmptyComposition(),
})
