import type { AdvertsRepository } from './adverts/types'
import type { LoginService } from './login/types'
import type { FilesService } from './files/types'
import type { TokenService } from './tokens/types'
import type { ProfileRepository } from './profile/types'
import type { NotificationService } from './notifications/types'
import type { UserMapper } from './users/types'

export interface Services {
    userMapper: UserMapper
    login: LoginService
    tokens: TokenService
    adverts: AdvertsRepository
    profiles: ProfileRepository
    files: FilesService
    notifications: NotificationService
}
