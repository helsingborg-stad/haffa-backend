export type AccessRole = 'Administratör' | 'Kommun' | 'Företag'

export interface AccessRule {
  pattern: string
  roles: string[]
}
export interface AccessService {
  isAuthorized: (emailAddress: string) => boolean
  hasRole: (emailAddress: string, roleName: AccessRole) => boolean
}
