import type { AdvertsRepository } from './adverts/types'
import type { CookieService, LoginService } from './login/types'
import type { FilesService } from './files/types'
import type { TokenService } from './tokens/types'
import type { ProfileRepository } from './profile/types'
import type { NotificationService } from './notifications/types'
import type { UserMapper } from './users/types'
import type { SettingsService } from './settings/types'
import type { JobExcecutorService } from './jobs/types'
import type { CategoryRepository } from './categories/types'
import type { EventLogService } from './events/types'

export interface StartupLog {
  echo: <TService>(
    service: TService,
    params: {
      name: string
      config: any
    }
  ) => TService
}

export interface Services {
  userMapper: UserMapper
  categories: CategoryRepository
  settings: SettingsService
  login: LoginService
  tokens: TokenService
  cookies: CookieService
  adverts: AdvertsRepository
  profiles: ProfileRepository
  files: FilesService
  notifications: NotificationService
  jobs: JobExcecutorService
  eventLog: EventLogService
}
