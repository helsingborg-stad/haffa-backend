import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { createAuthorizationService } from '../authorization-service'

const wrapResultAndError = <T>(fn: () => T): { result?: T; error?: Error } => {
  try {
    return {
      result: fn(),
    }
  } catch (error) {
    return { error: error as Error }
  }
}

const DefaultUser = { id: 'default', name: 'default user' }
const createAuthorizationServiceForTest = () =>
  createAuthorizationService('shared secret', () => DefaultUser)

describe('authorization-service', () => {
  it('tryGetUserFromJwt throw error {status: 401 unauthorized} on invalid signature', () => {
    const s = createAuthorizationServiceForTest()
    const { error } = wrapResultAndError(() =>
      s.tryGetUserFromJwt(jwt.sign({}, 'wrong shared secret'))
    )
    expect(error).toMatchObject({
      status: StatusCodes.UNAUTHORIZED,
      message: 'invalid signature',
    })
  })
  it('tryGetUserFromJwt throw error {status: 401 unauthorized} on malformed token', () => {
    const s = createAuthorizationServiceForTest()
    const { error } = wrapResultAndError(() =>
      s.tryGetUserFromJwt('a superbad token')
    )
    expect(error).toMatchObject({
      status: StatusCodes.UNAUTHORIZED,
      message: 'jwt malformed',
    })
  })
  it('tryGetUserFromJwt(<empty>) => <DEFAULT>', () => {
    const s = createAuthorizationServiceForTest()
    expect(s.tryGetUserFromJwt('')).toMatchObject(DefaultUser)
    expect(s.tryGetUserFromJwt(null as any as string)).toMatchObject(
      DefaultUser
    )
    expect(s.tryGetUserFromJwt(undefined as any as string)).toMatchObject(
      DefaultUser
    )
  })
  it('tryGetUserFromJwt(<valid token>) => <token payload>', () => {
    const s = createAuthorizationServiceForTest()
    const user = s.tryGetUserFromJwt(
      jwt.sign({ id: 123, name: 'Gandalf' }, 'shared secret')
    )
    expect(user).toMatchObject({
      id: 123,
      name: 'Gandalf',
    })
  })
})
