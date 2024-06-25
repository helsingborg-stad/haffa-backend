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

describe('authorization-service', () => {
  it('tryGetUserFromJwt throw error {status: 401 unauthorized} on invalid signature', () => {
    const s = createAuthorizationService('shared secret')
    const { error } = wrapResultAndError(() =>
      s.tryGetUserFromJwt(jwt.sign({}, 'wrong shared secret'))
    )
    expect(error).toMatchObject({
      status: StatusCodes.UNAUTHORIZED,
      message: 'invalid signature',
    })
  })
  it('tryGetUserFromJwt throw error {status: 401 unauthorized} on malformed token', () => {
    const s = createAuthorizationService('shared secret')
    const { error } = wrapResultAndError(() =>
      s.tryGetUserFromJwt('a superbad token')
    )
    expect(error).toMatchObject({
      status: StatusCodes.UNAUTHORIZED,
      message: 'jwt malformed',
    })
  })
  it('tryGetUserFromJwt(<empty>) => null', () => {
    const s = createAuthorizationService('shared secret')
    expect(s.tryGetUserFromJwt('')).toBeNull()
    expect(s.tryGetUserFromJwt(null as any as string)).toBeNull()
    expect(s.tryGetUserFromJwt(undefined as any as string)).toBeNull()
  })
  it('tryGetUserFromJwt(<valid token>) => <token payload>', () => {
    const s = createAuthorizationService('shared secret')
    const user = s.tryGetUserFromJwt(
      jwt.sign({ id: 123, name: 'Gandalf' }, 'shared secret')
    )
    expect(user).toMatchObject({
      id: 123,
      name: 'Gandalf',
    })
  })
})
