import { AdvertsRepository } from './adverts/types'
import { AccessService } from './access/types'
import { LoginService } from './login/types'
import { FilesService } from './files/types'
import { TokenService } from './tokens/types'
import { ProfileRepository } from './profile/types'

export interface Services {
    login: LoginService
    tokens: TokenService
    adverts: AdvertsRepository
    profiles: ProfileRepository
    access: AccessService
    files: FilesService
}
