import type { HaffaUser } from '../login/types'
import type { TokenService } from '../tokens/types'

export interface UserMapperConfig {
  allowGuestUsers: boolean
  phone: {
    allowPhoneUsers: boolean
    sender: string
    country: string
    roles: string[]
  }
}

export interface UserMapper {
  tryCreateGuestUser: () => Promise<HaffaUser | null>
  tryCreateGuestToken: (tokenService: TokenService) => Promise<string | null>
  mapAndValidateEmails: (emails: (string | null)[]) => Promise<HaffaUser[]>
  mapAndValidateUsers: (users: (HaffaUser | null)[]) => Promise<HaffaUser[]>
  mapAndValidateEmail: (email: string | null) => Promise<HaffaUser | null>
  mapAndValidateUser: (user: HaffaUser | null) => Promise<HaffaUser | null>
}
