import { join } from 'path'
import { getEnv } from '../../lib/gdi-api-node'
import type { StartupLog } from '../../types'
import type { SettingsService } from '../types'
import { createFsSettingsService } from './fs-settings-service'

export const tryCreateFsSettingsServiceFromEnv = (
  startupLog: StartupLog
): SettingsService | null => {
  const folder = getEnv('FS_DATA_PATH', { fallback: '' })
  return folder
    ? startupLog.echo(
        createFsSettingsService(join(process.cwd(), folder, 'settings')),
        {
          name: 'settings',
          config: {
            on: 'fs',
            folder,
          },
        }
      )
    : null
}
