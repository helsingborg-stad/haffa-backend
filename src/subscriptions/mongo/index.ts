import { getEnv } from '@helsingborg-stad/gdi-api-node'
import type { Services, StartupLog } from '../../types'
import type { SubscriptionsRepository } from '../types'
import { createMongoSubscriptionsConnection } from './connection'
import { createMongoSubscriptionsRepository } from './mongo-subscriptions-repository'

export const tryCreateMongoSubscriptionsRepositoryFromEnv = (
  startupLog: StartupLog,
  services: Pick<Services, 'adverts' | 'notifications' | 'userMapper'>
): SubscriptionsRepository | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_SUBSCRIPTIONS_COLLECTION', {
    fallback: 'subscriptions',
  })

  return uri
    ? startupLog.echo(
        createMongoSubscriptionsRepository(
          createMongoSubscriptionsConnection({ uri, collectionName }),
          services
        ),
        {
          name: 'subscriptions',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
          },
        }
      )
    : null
}
