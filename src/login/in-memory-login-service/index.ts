import { createIssuePincode } from '../issue-pincode'
import type { StartupLog } from '../../types'
import type { UserMapper } from '../../users/types'
import type { LoginService } from '../types'
import { createInMemoryLoginService } from './in-memory-login-service'
import { getEnv } from '../../lib/gdi-api-node'

export { createInMemoryLoginService }

export const createInMemoryLoginServiceFromEnv = (
  startupLog: StartupLog,
  userMapper: UserMapper
): LoginService =>
  startupLog.echo(
    createInMemoryLoginService(
      userMapper,
      createIssuePincode(getEnv('PASSWORDLESS_FIXED_PINCODE', { fallback: '' }))
    ),
    {
      name: 'login',
      config: {
        on: 'memory',
      },
    }
  )
