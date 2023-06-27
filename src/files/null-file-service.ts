import { FilesService } from './types'

export const createNullFileService = (): FilesService => ({
	tryConvertDataUrlToUrl: async () => null,
	tryCreateApplicationModule: () => null,
})