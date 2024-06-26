import ms from 'ms'
import type { LoginService } from '../types'
import { RequestPincodeStatus } from '../types'
import type {
  MongoConnection,
  MongoConnectionOptions,
} from '../../mongodb-utils/types'
import type { MongoLogin } from './types'
import { createMongoConnection } from '../../mongodb-utils'
import type { UserMapper } from '../../users/types'
import type { StartupLog } from '../../types'
import type { IssuePincode } from '../issue-pincode/types'
import { createIssuePincode } from '../issue-pincode'
import { getEnv } from '../../lib/gdi-api-node'

export const tryCreateMongoLoginServiceFromEnv = (
  startupLog: StartupLog,
  userMapper: UserMapper
): LoginService | null => {
  const uri = getEnv('MONGODB_URI', { fallback: '' })
  const collectionName = getEnv('MONGODB_LOGIN_COLLECTION', {
    fallback: 'login',
  })
  const ttl = ms(getEnv('LOGIN_ATTEMPT_TTL', { fallback: '10m' }))
  const maxAttempts = Math.max(
    1,
    parseInt(getEnv('LOGIN_ATTEMPT_MAX_COUNT', { fallback: '16' }), 10)
  )

  const issuePincode = createIssuePincode(
    getEnv('PASSWORDLESS_FIXED_PINCODE', { fallback: '' })
  )

  return uri
    ? startupLog.echo(
        createMongoLoginService(
          userMapper,
          createMongoLoginConnection({ uri, collectionName }),
          issuePincode,
          ttl,
          maxAttempts
        ),
        {
          name: 'login',
          config: {
            on: 'mongodb',
            uri,
            collectionName,
            ttl,
            maxAttempts,
          },
        }
      )
    : null
}

export const createMongoLoginConnection = ({
  uri,
  collectionName,
}: Pick<
  MongoConnectionOptions<MongoLogin>,
  'uri' | 'collectionName'
>): MongoConnection<MongoLogin> =>
  createMongoConnection({
    uri,
    collectionName,
    setupCollection: collection =>
      collection.createIndex(
        { id: 1 },
        { unique: true, name: 'unique_index__id' }
      ),
  })

export const createMongoLoginService = (
  userMapper: UserMapper,
  connection: MongoConnection<MongoLogin>,
  issuePincode: IssuePincode,
  ttl: number = ms('10m'),
  maxAttempts: number = 16
): LoginService => ({
  requestPincode: async (email, origin) => {
    const user = await userMapper.mapAndValidateEmail(email)
    if (!user) {
      return {
        status: RequestPincodeStatus.denied,
        pincode: '',
        user,
      }
    }
    const pincode = issuePincode()
    const collection = await connection.getCollection()
    // make sure we have an entry
    await collection.updateOne(
      { id: email },
      {
        $setOnInsert: { id: email, pending: [] },
      },
      {
        upsert: true,
      }
    )
    // append login attempt
    await collection.updateOne(
      { id: email },
      {
        $addToSet: { pending: { pincode, origin, expires: Date.now() + ttl } },
      }
    )

    // make sure we have only the most recent attempts
    await collection.updateOne(
      { id: email },
      {
        $push: {
          pending: {
            $each: [],
            // $sort: {'expires': 1},
            $slice: -maxAttempts,
          },
        },
      }
    )

    return {
      status: RequestPincodeStatus.accepted,
      pincode,
      user,
    }
  },
  tryLogin: async (email, pincode, origin) => {
    const collection = await connection.getCollection()
    const { modifiedCount } = await collection.updateOne(
      {
        id: email,
      },
      {
        $pull: {
          pending: {
            pincode: { $eq: pincode },
            origin: { $eq: origin },
            expires: {
              $lt: Date.now() + ttl,
              $gt: 0,
            },
          },
        },
      }
    )
    if (modifiedCount > 0) {
      return userMapper.mapAndValidateEmail(email)
    }
    return null
  },
})
