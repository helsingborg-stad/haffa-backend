import ms from 'ms'
import type { LoginService } from '../types'
import { RequestPincodeStatus } from '../types'
import type { UserMapper } from '../../users/types'
import type { IssuePincode } from '../issue-pincode/types'

interface Options {
  maxAge: number
  db: Record<string, LoginRequestEntry | null>
}

export interface LoginRequestEntry {
  pincode: string
  expires: number
}
export const createInMemoryLoginService = (
  userMapper: UserMapper,
  issuePincode: IssuePincode,
  options?: Partial<Options>
): LoginService => {
  const { maxAge, db }: Options = {
    db: {},
    maxAge: ms('10m'),
    ...options,
  }
  return {
    requestPincode: async email => {
      const user = await userMapper.mapAndValidateEmail(email)
      if (!user) {
        return {
          status: RequestPincodeStatus.denied,
          pincode: '',
        }
      }
      const pincode = issuePincode()
      db[email] = {
        pincode,
        expires: Date.now() + maxAge,
      }

      return {
        status: RequestPincodeStatus.accepted,
        pincode,
      }
    },
    tryLogin: async (email, pincode) => {
      const entry = db[email]
      if (entry && entry.pincode === pincode && entry.expires >= Date.now()) {
        // clear entry on successful login
        db[email] = null
        return userMapper.mapAndValidateEmail(email)
      }
      return null
    },
  }
}
