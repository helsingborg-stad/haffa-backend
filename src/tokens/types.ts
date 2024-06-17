import type { AuthorizationService } from '../lib/gdi-api-node'
import type { HaffaUser } from '../login/types'

export interface TokenService extends AuthorizationService {
  verify: (token: string) => Promise<boolean>
  sign: (user: HaffaUser) => string
  decode: (token: string) => Promise<HaffaUser | null>
}
