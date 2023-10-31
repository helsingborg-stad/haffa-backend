import type { AdvertsRepository } from '../adverts/types'
import type { NotificationService } from '../notifications/types'
import type { Services, StartupLog } from '../types'
import { tryCreateMongoSubscriptionsRepositoryFromEnv } from './mongo'
import { createNullSubscriptionsRepository } from './null-subscription-repository'
import type { SubscriptionsRepository } from './types'

export {
  createNullSubscriptionsRepository,
  tryCreateMongoSubscriptionsRepositoryFromEnv,
}

export const createSubscriptionsRepositoryFromEnv = (
  startupLog: StartupLog,
  services: Pick<Services, 'adverts' | 'notifications' | 'userMapper'>
): SubscriptionsRepository =>
  tryCreateMongoSubscriptionsRepositoryFromEnv(startupLog, services) ||
  startupLog.echo(createNullSubscriptionsRepository(), {
    name: 'subscriptions',
    config: { on: 'null' },
  })
