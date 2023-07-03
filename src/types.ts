import type { AdvertsRepository } from './adverts/types'
import type { AccessService } from './access/types'
import type { LoginService } from './login/types'
import type { FilesService } from './files/types'
import type { TokenService } from './tokens/types'
import type { ProfileRepository } from './profile/types'

export interface Services {
  login: LoginService
  tokens: TokenService
  adverts: AdvertsRepository
  profiles: ProfileRepository
  access: AccessService
  files: FilesService
}
