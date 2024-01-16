import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createUserMapper, isValidEmail } from './user-mapper'
import type { SettingsService } from '../settings/types'
import type { StartupLog } from '../types'
import type { UserMapper } from './types'
import { userMapperConfigAdapter } from './user-mapper-config-adapter'
import { createUserMapperGqlModule } from './user-mapper-gql-module'

export {
  createUserMapper,
  isValidEmail,
  userMapperConfigAdapter,
  createUserMapperGqlModule,
}

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
