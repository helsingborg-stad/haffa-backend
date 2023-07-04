import type { AuthorizationService } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import type { HaffaUser } from '../login/types'

export interface TokenService extends AuthorizationService {
  verify: (token: string) => boolean
  sign: (user: HaffaUser) => string
  decode: (token: string) => HaffaUser|null
}
