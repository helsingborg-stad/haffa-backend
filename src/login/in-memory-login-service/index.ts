import type { StartupLog } from '../../types'
import type { UserMapper } from '../../users/types'
import type { LoginService } from '../types'
import { createInMemoryLoginService } from './in-memory-login-service'

export { createInMemoryLoginService }

export const createInMemoryLoginServiceFromEnv = (
  startupLog: StartupLog,
  userMapper: UserMapper
): LoginService =>
  startupLog.echo(createInMemoryLoginService(userMapper), {
    name: 'login',
    config: {
      on: 'memory',
    },
  })
