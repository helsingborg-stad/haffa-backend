import { AuthorizationService } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { AdvertsRepository } from './adverts/types'
import { AccessService } from './access/types'
import { LoginService } from './login/types'
export interface Services {
    authorization: AuthorizationService
    login: LoginService
    adverts: AdvertsRepository,
    access: AccessService
}
