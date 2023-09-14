import type { StartupLog } from '../../types'
import type { SettingsService } from '../types'
import { createInMemorySettingsService } from './in-memory-settings'

export { createInMemorySettingsService }

export const createInMemorySettingsServiceFromEnv = (
  startupLog: StartupLog
): SettingsService =>
  startupLog.echo(createInMemorySettingsService(), {
    name: 'settings',
    config: { on: 'memory' },
  })
