import { Exception } from 'handlebars'
import type { StartupLog } from '../types'
import { tryCreateFsSettingsServiceFromEnv } from './fs'
import {
  createInMemorySettingsService,
  createInMemorySettingsServiceFromEnv,
} from './memory'
import { tryCreateMongoDbSettingsServiceFromEnv } from './mongodb'
import type { SettingsService } from './types'

export { createInMemorySettingsService }

export const createSettingsServiceFromEnv = (
  startupLog: StartupLog
): SettingsService =>
  tryCreateMongoDbSettingsServiceFromEnv(startupLog) ||
  tryCreateFsSettingsServiceFromEnv(startupLog) ||
  createInMemorySettingsServiceFromEnv(startupLog)
