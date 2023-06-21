import { AuthorizationService } from '@helsingborg-stad/gdi-api-node/services/authorization-service'
import { AdvertsRepository } from './adverts/types'
import { AccessService } from './access/types'
export interface Services {
    authorization: AuthorizationService
    adverts: AdvertsRepository,
    access: AccessService
}
