import type { HaffaUserRoles } from '../login/types'

export interface LoginPolicy {
  emailPattern: string
  roles: HaffaUserRoles
  deny: boolean
}
