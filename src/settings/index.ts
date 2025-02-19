import { Exception } from 'handlebars'
import {
  createInMemorySettingsService,
  createInMemorySettingsServiceFromEnv,
} from './memory'
import type { SettingsService } from './types'
import { tryCreateFsSettingsServiceFromEnv } from './fs'
import { tryCreateMongoDbSettingsServiceFromEnv } from './mongodb'
import type { StartupLog } from '../types'

export { createInMemorySettingsService }

export const createSettingsServiceFromEnv = (
  startupLog: StartupLog
): SettingsService =>
  tryCreateMongoDbSettingsServiceFromEnv(startupLog) ||
  tryCreateFsSettingsServiceFromEnv(startupLog) ||
  createInMemorySettingsServiceFromEnv(startupLog)
