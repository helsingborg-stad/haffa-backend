import { ApplicationModule } from '@helsingborg-stad/gdi-api-node'

export interface FilesService {
	tryConvertDataUrlToUrl: (dataUrl: string) => Promise<string|null>
	tryCreateApplicationModule: () => ApplicationModule|null
}