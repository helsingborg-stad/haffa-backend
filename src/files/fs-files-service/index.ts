import { join } from 'path'
import { getEnv } from '../../lib/gdi-api-node'
import type { StartupLog } from '../../types'
import type { FilesService } from '../types'
import { createFsFilesService } from './fs-files-service'

export const tryCreateFsFilesServiceFromEnv = (
  startupLog: StartupLog
): FilesService | null => {
  const folder = getEnv('FS_DATA_PATH', { fallback: '' })
  return folder
    ? startupLog.echo(
        createFsFilesService(join(process.cwd(), folder, 'files')),
        {
          name: 'files',
          config: {
            on: 'fs',
            folder,
          },
        }
      )
    : null
}
