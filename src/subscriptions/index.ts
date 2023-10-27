import type { StartupLog } from '../types'
import { tryCreateMongoSubscriptionsRepositoryFromEnv } from './mongo'
import { createNullSubscriptionsRepository } from './null-subscription-repository'
import type { SubscriptionsRepository } from './types'

export {
  createNullSubscriptionsRepository,
  tryCreateMongoSubscriptionsRepositoryFromEnv,
}

export const createSubscriptionsRepositoryFromEnv = (
  startupLog: StartupLog
): SubscriptionsRepository =>
  tryCreateMongoSubscriptionsRepositoryFromEnv(startupLog) ||
  startupLog.echo(createNullSubscriptionsRepository(), {
    name: 'subscriptions',
    config: { on: 'null' },
  })
