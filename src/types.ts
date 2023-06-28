import { AuthorizationService } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { AdvertsRepository } from './adverts/types'
import { AccessService } from './access/types'
import { LoginService } from './login/types'
import { FilesService } from './files/types'
import { TokenService } from './tokens/types'
export interface Services {
    authorization: AuthorizationService
    login: LoginService
    tokens: TokenService
    adverts: AdvertsRepository
    access: AccessService
    files: FilesService
}
