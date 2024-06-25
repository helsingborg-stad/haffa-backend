import type { ApplicationModule } from '../lib/gdi-api-node'

export interface FilesService {
  tryConvertDataUrlToUrl: (dataUrl: string) => Promise<string | null>
  tryConvertUrlToDataUrl: (url: string) => Promise<string | null>
  tryCreateApplicationModule: () => ApplicationModule | null
  tryCleanupUrl: (url: string) => Promise<void>
}
