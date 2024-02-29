import type { FilesService } from './types'

export const createNullFileService = (): FilesService => ({
  tryConvertDataUrlToUrl: async () => null,
  tryConvertUrlToDataUrl: async () => null,
  tryCreateApplicationModule: () => null,
  tryCleanupUrl: () => Promise.resolve(),
})
