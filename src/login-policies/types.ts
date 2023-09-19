import type { HaffaUserRoles } from '../login/types'

export interface LoginPolicy {
  emailPattern: string
  roles: (keyof HaffaUserRoles)[] // props from HaffaUserRoles
  deny: boolean
}
