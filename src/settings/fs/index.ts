import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { join } from 'path'
import type { SettingsService } from '../types'
import { createFsSettingsService } from './fs-settings-service'

export const tryCreateFsSettingsServiceFromEnv = (): SettingsService | null => {
  const folder = getEnv('FS_DATA_PATH', { fallback: '' })
  return folder
    ? createFsSettingsService(join(process.cwd(), folder, 'settings'))
    : null
}
