import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { join } from 'path'
import type { FilesService } from '../types'
import { createFsFilesService } from './fs-files-service'
import type { StartupLog } from '../../types'

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
