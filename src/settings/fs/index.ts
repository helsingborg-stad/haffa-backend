import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { join } from 'path'
import type { SettingsService } from '../types'
import { createFsSettingsService } from './fs-settings-service'
import type { StartupLog } from '../../types'

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
