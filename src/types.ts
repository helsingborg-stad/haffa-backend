import { AuthorizationService } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { AdvertsRepository } from './adverts/types'
import { AccessService } from './access/types'
import { LoginService } from './login/types'
import { FilesService } from './files/types'
export interface Services {
    authorization: AuthorizationService
    login: LoginService
    adverts: AdvertsRepository
    access: AccessService
    files: FilesService
}
