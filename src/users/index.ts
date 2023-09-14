import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createUserMapper } from './user-mapper'
import type { SettingsService } from '../settings/types'
import type { StartupLog } from '../types'
import type { UserMapper } from './types'

export { createUserMapper }

export const createUserMapperFromEnv = (
  startupLog: StartupLog,
  settings: SettingsService
): UserMapper => {
  const superUser = getEnv('SUPER_USER', { fallback: '' })
  return startupLog.echo(createUserMapper(superUser, settings), {
    name: 'user mapper',
    config: { superUser },
  })
}
