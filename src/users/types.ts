import type { HaffaUser } from '../login/types'

export interface UserMapper {
  mapAndValidateEmails: (emails: (string | null)[]) => Promise<HaffaUser[]>
  mapAndValidateUsers: (users: (HaffaUser | null)[]) => Promise<HaffaUser[]>
  mapAndValidateEmail: (email: string | null) => Promise<HaffaUser | null>
  mapAndValidateUser: (user: HaffaUser | null) => Promise<HaffaUser | null>
}
