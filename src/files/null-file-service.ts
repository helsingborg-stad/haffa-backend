import type { FilesService } from './types'

export const createNullFileService = (): FilesService => ({
  tryConvertDataUrlToUrl: async () => null,
  tryCreateApplicationModule: () => null,
  tryCleanupUrl: () => Promise.resolve(),
})
